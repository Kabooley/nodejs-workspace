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
 * TODO: navigationインスタンスもpageインスタンスの数に合わせて生成しなくてはならない
 *  なのでNavigationをpageインスタンスに因らないものにできたらいいだろうか？
 * TODO: executor()はpromiseを返さなくていいのか？async関数のままでいいのか？
 * TODO: メモリリーク対策として、関数へ引数として渡されたインスタンスは関数内部でundefinedにした方がいいのか？不要か？
 * TODO: 動作確認
 * *************************************************************/ 
 import type puppeteer from 'puppeteer';
 import * as jsdom from 'jsdom';
 import { Navigation } from './Navigation';
 import { takeOutPropertiesFrom } from '../utilities/objectModifier';
 
 const { JSDOM } = jsdom;
 const navigation = new Navigation();
 const artworkUrl: string = `https://www.pixiv.net/artworks/`;
 const defaulRequirement: (keyof iIllustData)[] = [
     "illustId", "illustTitle", "id", "title", "illustType", "urls", "pageCount", "bookmarkCount"
 ];
 
 
 /***
  * @return {iMetaPreloadData | undefined} 
  *  - If `retrieveDataFromNavigationResponses` could retrieve data,
  *    then return iMetaPreloadData. 
  *    If no data inside of HTTPResponse then undefined returned.
  * 
  * navigation.navigateBy(page.goto())から返された戻り値の配列から、
  * page.goto()の戻り値のHTTPResponseを取り出し、
  * さらにそこからbodyのデータを取得する。
  * bodyからのデータはHTML形式で、特定のｍetaデータが取得出来たらそれを返す。
  * 
  * 役割多すぎじゃない？
  * */ 
 const retrieveDataFromNavigationResponses = async (responses: (puppeteer.HTTPResponse | any)[]): Promise<iMetaPreloadData | undefined> => {
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
  * 
  * HTTPResponse body: iMetaPreloadData
  * ["illust", id]
  * */  
 const executor = async (p: puppeteer.Page, id: string, container: iIllustData[], requirement?: (keyof iIllustData)[]): Promise<void> => {
     try {
        // DEBUG:
        console.log("executor()...");

         const navigationResponses: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(p, p.goto(artworkUrl + id, { waitUntil: ["load", "networkidle2"]}));
         const metaPreloadData: iMetaPreloadData | undefined = await retrieveDataFromNavigationResponses(navigationResponses);
         if(
             metaPreloadData !== undefined 
             && metaPreloadData!.hasOwnProperty("illust")
             && metaPreloadData.illust[id] !== undefined
         ) {

             // DEBUG:
             console.log("collected illustData...");

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

         // DEBUG:
         console.log(`concurrency: ${concurrency}`);
 
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

             // DEBUG:
             console.log(`circulator: ${circulator}`);

             if(sequences[circulator] !== undefined && pageInstances[circulator] !== undefined) {

                // DEBUG:
                console.log("sequence");
                
                sequences[circulator] = sequences[circulator]!.then(() => executor(pageInstances[circulator]!, id, collected, requirement));
             }
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
                if(index > 0) p.close();
            });
         };
     }
 };


// /****************************************************************
//  * Artoworkページから任意の情報を取得する機能。
//  * 
//  * ArtworkページURLの末尾のid一覧からなる配列を取得し、
//  * 
//  * 配列の各idを追加したURLへアクセスしてArtworkページの情報を、
//  * 
//  * HTTPResponseから取得する。
//  * 
//  * TODO: もしかしたらnavigate.navigationBy()からの戻り値が期待通りじゃないかもしれない。
//  * **************************************************************/

// import type puppeteer from "puppeteer";
// import * as jsdom from 'jsdom';
// import { Navigation } from './Navigation';
// import { takeOutPropertiesFrom } from '../utilities/objectModifier';


interface iMetaPreloadData {
    timestamp: string;
    illust: iIllust;
};

interface iIllust {
    [key: string]: iIllustData;
};

interface iIllustData {
    illustId:string;
    illustTitle: string;
    illustComment: string;
    id: string;
    title: string;
    description: string;
    illustType: number;
    createDate: string;
    uploadDate: string;
    sl: number;
    urls: {
        mini: string;
        thumb: string;
        small: string;
        regular: string;
        original: string;
    },
    tags: {};
    pageCount: number;
    bookmarkCount: number;
    likeCount:number;
}



// const { JSDOM } = jsdom;
// const artworkUrl: string = `https://www.pixiv.net/artworks/`;
// const defaulRequirement: (keyof iIllustData)[] = [
//     "illustId", "illustTitle", "id", "title", "illustType", "urls", "pageCount", "bookmarkCount"
// ];


// /***
//  * 前提：配列`res`の第一引数は、page.waitForResponseからの戻り値のHTTPResponseである
//  * 
//  * 
//  * */ 
// export const collectArtworksData = async (
//         page: puppeteer.Page, 
//         ids: string[], 
//         requirement?: (keyof iIllustData)[]
//     ): Promise<iIllustData[]> => {
//         try {
//             const navigate = new Navigation(page);
//             let collected: iIllustData[] = [];
//             let promise: Promise<void> = Promise.resolve();
       
//             for(const id of ids) {
//                 // DEBUG:
//                 console.log(`Collecting data from ${artworkUrl}${id}`);

//                 // NOTE: response.text()取得できるまで次のループへ行かない
//                let resolved: (puppeteer.HTTPResponse | any)[] = await navigate.navigateBy(function(){ return page.goto(artworkUrl + id)});
                
//                 const response: puppeteer.HTTPResponse = resolved.pop();
//                 let metaPreloadData: iMetaPreloadData | undefined;

//                 if(response.headers().hasOwnProperty("content-type") && response.headers()["content-type"]!.includes('text/html')){
//                     const { document } = new JSDOM(await response.text()).window;
//                     const json = document.querySelector('#meta-preload-data')!.getAttribute("content");
//                     metaPreloadData = json ? JSON.parse(json): undefined;
//                 };

//                 // text()取得出来たら後回しでいい
//                 promise = promise.then(() => {
//                     console.log("promise pushed");
//                     // So much undefined guard...
//                     if(
//                         metaPreloadData !== undefined 
//                         && metaPreloadData!.hasOwnProperty("illust")
//                         && metaPreloadData.illust[id] !== undefined
//                     ) {
//                         const i: iIllustData = metaPreloadData.illust[id] as iIllustData;
//                         collected.push(takeOutPropertiesFrom<iIllustData>(i, requirement === undefined ? defaulRequirement : requirement));
//                     };
//                 });
//             };
//             await promise;
//             return collected;
//         }
//         catch(e) {
//             await page.screenshot({type: "png", path: "./dist/errorCollectFromArtworkPage.png"});
//             throw e;
//         }
//  };