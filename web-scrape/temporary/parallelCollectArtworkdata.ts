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
 * TODO: ループで関数をスマートに順番に呼び出したい
 * 参考：https://stackoverflow.com/a/52985373
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


const retrieveDataFromNavigationResponses = async (responses: (puppeteer.HTTPResponse | any)[]): Promise<iIllustData> => {
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
 * 
 * 
 * */  
const executor = async (p: puppeteer.Page, id: string, container: iIllustData[], requirement?: (keyof iIllustData)[]): Promise<void> => {
    try {
        const navigationResponses: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(p.goto(`url/${id}`, { waitUntil: ["load", "networkidle2"]}));
        const metaPreloadData: iMetaPreloadData | undefined = await retrieveDataFromNavigationResponses(navigationResponses);
        if(
            metaPreloadData !== undefined 
            && metaPreloadData!.hasOwnProperty("illust")
            && metaPreloadData.illust[id] !== undefined
        ) {
            const i: iIllustData = metaPreloadData.illust[id] as iIllustData;
            container.push(takeOutPropertiesFrom<iIllustData>(i, requirement === undefined ? defaulRequirement : requirement));
        }
    }
    catch(e) {
        throw e;
    }
};

// TODO: pageインスタンスは一つだけでいいなら条件分岐で別の処理にするべきか検討
export const collectArtworkData = async (browser: puppeteer.Browser, page: puppeteer.Page, ids: string[], requirement?: (keyof iIllustData)[]): Promise<iIllustData[]> => {
    try {
        let collected: iIllustData[] = [];
        let sequences: Promise<void>[] = [];
        let pageInstances: puppeteer.Page[] = [];
        let concurrency: number = 1;

        // データ量が50以下なら処理プロセス２で並列処理
        if(ids.length > 10 && ids.length <= 50) {
            concurrency = 2;
        }
        // データ量５０を超えるなら処理プロセス３で並列処理
        else if(ids.length > 50) {
            concurrency = 4;
        }

        pageInstances.push(page);
        /***
         * concurrency === 4で、indexが1からスタートすると...
         * 
         * index % concurrencyは
         * 1, 2, 3, 4, 1, 2, 3, 4で１～４の範囲で循環する。
         * 
         * ただしこれだと添え字として範囲外になるので
         * 
         * index % (concurrency - 1)で循環させる
         * 
         * TODO: 循環がうまくいくのか確認
         * */ 
        for(let i = 1; i < concurrency; i++) {
            pageInstances.push(await browser.newPage());
            sequences.push(Promise.resolve());
        };
        ids.forEach((id: string, index: number) => {
            // const circulator: number = (index % concurrency) - 1;
            const circulator: number = index % (concurrency - 1);
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
        /* TODO: 新たに生成したpageインスタンスをどうにかcloseさせたい */ 
        while(pageInstances.length) {
            
        }
    }
}


// const collectArtworkData = async (browser: puppeteer.Browser, page: puppeteer.Page, ids: string[]): Promise<iDataWhatIwant[]> => {
//     try {
//         let collected: iDataWhatIwant[] = [];
//         let tasks: (() => Promise<void>)[] = [];
//         let pageInstances: puppeteer.Page[] = [];

//         // データ量が50以下なら処理プロセス２で並列処理
//         if(ids.length > 10 && ids.length <= 50) {
//             const temporaryPage1: puppeteer.Page = browser.newPage();

//             let it: string[] = [...ids];
//             let sequence1 = Promise.resolve();
//             let sequence2 = Promise.resolve();
            
//             while(it.length > 0) {
//                 sequence1 = sequence1.then(() => executor(page, it!.pop());
//                 if(it.length >= 0) sequence2 = sequence2.then(() => executor(temporaryPage1, it!.pop()));
//             } 
            
//             await Promise.all([sequence1, sequence2]);
//             temporaryPage1.close();
//             temporaryPage1 = undefined;
//         }
//         // データ量５０を超えるなら処理プロセス３で並列処理
//         else if(ids.length > 50) {
//             const temporaryPage1: puppeteer.Page = browser.newPage();
//             const temporaryPage2: puppeteer.Page = browser.newPage();

//             let it: string[] = [...ids];
//             let sequence1 = Promise.resolve();
//             let sequence2 = Promise.resolve();
//             let sequence3 = Promise.resolve();
            
//             while(it.length > 0) {
//                 sequence1 = sequence1.then(() => executor(page, it!.pop());
//                 if(it.length >= 0) sequence2 = sequence2.then(() => executor(temporaryPage1, it!.pop()));
//                 if(it.length >= 0) sequence3 = sequence3.then(() => executor(temporaryPage2, it!.pop()));
//             } 
            
//             await Promise.all([sequence1, sequence2, sequence3]);
//             temporaryPage1.close();
//             temporaryPage2.close();
//             temporaryPage1 = undefined;
//             temporaryPage2 = undefined;
//         }
//         // データ量少ないなら逐次処理だけ
//         else {
//             let sequence = Promise.resolve();
//             ids.forEach((id: string) => {
//                 sequence = sequence.then(() => {
//                     executor(page, id)
//                 });
//             });

//             sequence.then(() => {

//             }).catch(e => {throw e});
//         }

//         return collected;

//     }
//     catch(e) {
//         await page.screenshot({type: 'png', path: './dist/errorWhileCollectingArtworkData.png'});
//         throw e;
//     }
//     finally {
//         /* 新たに生成したpageインスタンスをどうにかcloseさせたい */ 
//     }
// }

