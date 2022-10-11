/***************************************************************
 * 逐次処理：
 * 
 * 下記の一連の処理が完了して初めて次のページへ遷移できる
 * 
 * - navigation by page.goto()
 * - retrieve data form httpresponse body
 * - （ここは後回しでもいい）push data to collection array
 * 
 * 理由は、
 * HTTPレスポンスからデータ取得するときに使うpuppeteer.HTTPResponse.text()はそのページにいるときじゃないと
 * 取得できないから。
 * 
 * なので、同一のpageインスタンスに対して並列処理はできない。
 * 
 * ということで、pageインスタンスを増やして、pageインスタンス同士を並列処理させる。
 * 
 * TODO: executor()はpromiseを返さなくていいのか？async関数のままでいいのか？
 * TODO: メモリリーク対策として、関数へ引数として渡されたインスタンスは関数内部でundefinedにした方がいいのか？不要か？
 * TODO: 動作確認
 * *************************************************************/ 
 import type puppeteer from 'puppeteer';
 import * as jsdom from 'jsdom';
 import { Navigation } from './components/Navigation';
 import { takeOutPropertiesFrom } from '../utilities/objectModifier';
 import type { iMetaPreloadData, iIllust, iIllustData } from './components/errorCollectFromArtworkPage';
 
 const { JSDOM } = jsdom;
 const navigation = new Navigation();
 const artworkUrl: string = `https://www.pixiv.net/artworks/`;
 const defaulRequirement: (keyof iIllustData)[] = [
     "illustId", "illustTitle", "id", "title", "illustType", "urls", "pageCount", "bookmarkCount"
 ];
 
 
 /***
  * @return {iMetaPreloadData | undefined} 
  *     - If `retrieveDataFromNavigationResponses` could retrieve data,
  *       then return iMetaPreloadData. 
  *       If no data inside of HTTPResponse then undefined returned.
  * 
  * navigation.navigateBy(page.goto())から返された戻り値の配列から、
  * page.goto()の戻り値のHTTPResponseを取り出し、
  * さらにそこからbodyのデータを取得する。
  * bodyからのデータはHTML形式で、特定のｍetaデータが取得出来たらそれを返す。
  * 
  * 役割多すぎじゃない？
  * */ 
 const retrieveDataFromNavigationResponses = async (responses: (puppeteer.HTTPResponse | any)[]): Promise<iMetaPreloadData> => {
     const response: puppeteer.HTTPResponse = responses.pop();
     let metaPreloadData: iMetaPreloadData | undefined;
 
     if(response.headers().hasOwnProperty("content-type") && response.headers()["content-type"]!.includes('text/html')){
         const { document } = new JSDOM(await response.text()).window;
         const json = document.querySelector('#meta-preload-data')!.getAttribute("content");
         metaPreloadData = json ? JSON.parse(json): undefined;
     };
 
     return metaPreloadData;
  };
 
 
 /***
  * 指定URL+idからなるartoworkページのURLへpage.goto()してrequirementが求めるデータを取得する
  * 取得したデータは引数containerへ格納する。
  * */  
 const executor = async (p: puppeteer.Page, id: string, container: iIllustData[], requirement?: (keyof iIllustData)[]): Promise<void> => {
     try {
         const navigationResponses: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(p.goto(artworkUrl + id, { waitUntil: ["load", "networkidle2"]}));
         const metaPreloadData: iMetaPreloadData | undefined = await retrieveDataFromNavigationResponses(navigationResponses);
         if(
             metaPreloadData !== undefined 
             && metaPreloadData!.hasOwnProperty("illust")
             && metaPreloadData.illust[id] !== undefined
         ) {
             const illustData: iIllustData = metaPreloadData.illust[id] as iIllustData;
             container.push(takeOutPropertiesFrom<iIllustData>(illustData, requirement === undefined ? defaulRequirement : requirement));
         }
     }
     catch(e) {
         throw e;
     }
 };

 /****
  * @param {puppeteer.Browser} browser - Browser instance
  * @param {puppeteer.Page} page - Page instance 
  * @param {string[]} ids - Array of id string
  * @param {(keyof iIllustData)[]} [requirement] - 
  * 
  * Increase the number of processes according to the amount of data received 
  * and have the processes process in parallel.
  * 
  * よく考えたら、pageは引数で取得しないで、
  * browserだけ取得してすべてのpageインスタンスはこの関数で新たに生成するようにすればよかったかも...
  * */  
 export const collectArtworkData = async (
    browser: puppeteer.Browser, 
    page: puppeteer.Page, 
    ids: string[], 
    requirement?: (keyof iIllustData)[])
    : Promise<iIllustData[]> => {

    let pageInstances: puppeteer.Page[] = [];
    let collected: iIllustData[] = [];
    let sequences: Promise<void>[] = [];
    let concurrency: number = 1;
        
    try {
         // データ量が50以下なら処理プロセス２つを並列処理
         if(ids.length > 10 && ids.length <= 50) {
             concurrency = 2;
         }
         // データ量が50を超えるなら処理プロセス４つを並列処理
         else if(ids.length > 50) {
             concurrency = 4;
         }
 
         pageInstances.push(page);
         for(let i = 1; i < concurrency; i++) {
             pageInstances.push(await browser.newPage());
             sequences.push(Promise.resolve());
         };
         ids.forEach((id: string, index: number) => {
            // 順番にidsの添え字を生成する
            // 0~(concurrency-1)の範囲でcirculatorは循環する
            // なので添え字アクセスは範囲内に収まる
             const circulator: number = index % concurrency;
             sequences[circulator] = sequences[circulator].then(() => executor(pageInstances[circulator], id, collected, requirement));
         });
 
         await Promise.all([...sequences]);
         return collected;
 
     }
     catch(e) {
         await page.screenshot({type: 'png', path: './dist/errorWhileCollectingArtworkData.png'});
         throw e;
     }
     finally {
         // Close all generated instances in this function except those passed as argument.
         if(pageInstances.length > 1) {
            pageInstances.forEach((p: puppeteer.Page, index: number) => {
                if(index > 0) {p.close(); p = undefined;}
            });
         };
        // TODO: 元のbrowserインスタンスがundefinedになっていないか一応確認
         browser = undefined;
     }
 };
