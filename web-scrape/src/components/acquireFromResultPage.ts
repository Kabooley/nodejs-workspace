/*******************************************************
 * 検索結果ページ（正しくはそのページにアクセスしたときのHTTPResponse）からほしい情報を取得して収集する。
 * 
 * 前の処理段階で増加させるpageインスタンスが決められており、
 * ここではインスタンスどうし並列処理させて、
 * インスタンス毎逐次処理させる。
 * 
 * page: puppeteer.Pageインスタンス, 
 * pageInstances: pageインスタンスを格納している配列
 * sequence: 各pageの逐次処理taskQueue
 * concurrency: 並列処理同時実行数上限
 * 
 * 
 * 外部でこのモジュールが呼び出されるとして、
 * 前提とする変数をすべて引き取らなくてはいけないはず...
 * (検索結果ページがなんページなのかとか)
 * 
 * *****************************************************/ 
import type puppeteer from 'puppeteer';
import type { iIllustMangaDataElement, iBodyIncludesIllustManga } from '../constants/illustManga';
import { Collect } from './Collect';
import { Navigation} from './Navigation';
import { retrieveDeepProp } from '../utilities/objectModifier';

export class CollectResultPage<T> {
    pageInstances: puppeteer.Page[] = [];
    sequences: Promise<void>[] = [];
    concurrency: number;
    navigation: Navigation;
    collector: Collect<T>;
    collected: T[];
    constructor(private browser: puppeteer.Browser, concurrency: number,  keyword: string){
        this.concurrency = concurrency;
        this.navigation = new Navigation();
        this.collector = new Collect<T>();
        this.collected = [];
    };

    async _generatePageInstances() {
        return this.pageInstances.push(await this.browser.newPage());
    };

    _initializeSequences() {
        return this.sequences.push(Promise.resolve());
    };

    _resetResponseFilter(filter: (res: puppeteer.HTTPResponse) => boolean | Promise<boolean>) {
        this.navigation.resetFilter(filter);
    };

    // Generate new instances according to this.concurrency
    initialize() {
        for(let i = 0; i < this.concurrency; i++) {
            this._initializeSequences();
            // TODO: async関数をいかにして呼出すか...
        }
    };


    _resolveJson(responses: (puppeteer.HTTPResponse | any)[]) {
        return responses.shift().json() as iBodyIncludesIllustManga;
    };

    _collect() {

    }

    _executor(page: puppeteer.Page, navigation: Navigation, currentPage: number): Promise<void> {
        try {
            const url: string = `https://www.pixiv.net/ajax/search/artworks/${encodeURIComponent(keyword)}?word=${encodeURIComponent(keyword)}&order=date_d&mode=all&p=${currentPage}&s_mode=s_tag&type=all&lang=ja`;
    
            // setup navigation filter.
            navigation.resetFilter((res: puppeteer.HTTPResponse) => res.status() === 200 && res.url() === url);
            // let it navigate to the url.
            const responces: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(page, page.goto(url));
            // HTTPResponseから必要なデータを取得する
            const illustMangaDataElements: iIllustMangaDataElement[] = retrieveDeepProp<iIllustMangaDataElement[]>(["body", "illustManga", "data"], (await responces.shift().json()) as iBodyIncludesIllustManga); 
            // Check if the data is exist
            if(illustMangaDataElements === undefined) throw new Error("Error: ")
            // Retrieve and save. 
            collector.resetData(illustMangaDataElements);
            collectedIds = [...collectedIds, ...collector.execute("id")];
        }
        catch(e) {
            console.error(e);
            throw e;
        }

    }

    generateTasks() {
        for(let currentPage = 1; currentPage < numberOfPages; currentPage++) {
            const circulator: number = currentPage % concurrency;
            if(this.sequences[circulator] !== undefined) {
                this.sequences[circulator] = this.sequences[circulator]!
                // Reset navigation filter function.
                .then(() => this._executor(this.pageInstances[circulator]!, this.navigation, currentPage))
            }
            else {
                console.error("RangeError: Accessing out range of array.");
            }
        }
        return this.sequences;
    }

    // finally() will not be invoked automatically.
    // But this method must be called after all process is done.
    finally() {

    }
}

// 検索結果の各artworkのidを格納する
let collectedIds: string[] = [];
const collector: Collect<iIllustMangaDataElement> = new Collect<iIllustMangaDataElement>();

const executor = async (page: puppeteer.Page, navigation: Navigation, keyword: string, currentPage: number) => {
    try {
        const url: string = `https://www.pixiv.net/ajax/search/artworks/${encodeURIComponent(keyword)}?word=${encodeURIComponent(keyword)}&order=date_d&mode=all&p=${currentPage}&s_mode=s_tag&type=all&lang=ja`;

        // setup navigation filter.
        navigation.resetFilter((res: puppeteer.HTTPResponse) => res.status() === 200 && res.url() === url);
        // let it navigate to the url.
        const responces: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(page, page.goto(url));
        // HTTPResponseから必要なデータを取得する
        const illustMangaDataElements: iIllustMangaDataElement[] = retrieveDeepProp<iIllustMangaDataElement[]>(["body", "illustManga", "data"], (await responces.shift().json()) as iBodyIncludesIllustManga); 
        // Check if the data is exist
        if(illustMangaDataElements === undefined) throw new Error("Error: ")
        // Retrieve and save. 
        collector.resetData(illustMangaDataElements);
        collectedIds = [...collectedIds, ...collector.execute("id")];
    }
    catch(e) {
        console.error(e);
        throw e;
    }
}



/*******
 * TODO: taskを組み立てるだけ
 * 実行はしない
 * 
 * というようにしたい
 * 
 * TODO: finallyを組み込んでここで生成したpageインスタンスを必ずcloseする
 *  classにした方がいいのかも
 * 
 * TODO: async/awaitとPromiseチェーンが両方存在している問題
 * 
 * promise = promise.then(() => somethinfIwannaDo())をループさせて行くので
 * somethinfIWannaDoのなかでpromiseチェーンを形成するわけにはいかない
 * */ 
// VER.2
// then() returns async function.
// TODO: Make sure returning async function from then() is correct.
export const setupTasks = async (
    browser: puppeteer.Browser,
    numberOfProcess: number,    // 作成するpageインスタンスの数
    numberOfPages: number,       // 検索結果ページがなんページなのか
    keyword: string             // 検索キーワード
    ): Promise<Promise<void>[]> => {
    let concurrency: number = numberOfProcess;
    const pageInstances: puppeteer.Page[] = [];
    const sequences: Promise<void>[] = [];
    const navigation: Navigation = new Navigation();

    for(let i = 0; i < concurrency; i++) {
        pageInstances.push(await browser.newPage());
        sequences.push(Promise.resolve());
    }
    // NOTE: iは検索結果ページのページ番号と同じになる
    for(let currentPage = 1; currentPage < numberOfPages; currentPage++) {
        const circulator: number = currentPage % concurrency;
        if(sequences[circulator] !== undefined) {
            sequences[circulator] = sequences[circulator]!
            // Reset navigation filter function.
            .then(() => executor(pageInstances[circulator]!, navigation, keyword, currentPage))
        }
        else {
            console.error("RangeError: Accessing out range of array.");
        }
    }
    return sequences;
};

// -- Ver.1 --
// 
// const setupTasks = (
//     browser: puppeteer.Browser,
//     numberOfProcess: number,    // 作成するpageインスタンスの数
//     numberOfPages: number,       // 検索結果ページがなんページなのか
//     ): Promise<void>[] => {
//     let concurrency: number = numberOfProcess;
//     const pageInstances: puppeteer.Page[] = [];
//     const sequences: Promise<void>[] = [];
//     const navigation: Navigation = new Navigation();

//     for(let i = 0; i < concurrency; i++) {
//         pageInstances.push(await browser.newPage());
//         sequences.push(Promise.resolve());
//     }
//     // NOTE: iは検索結果ページのページ番号と同じになる
//     for(let currentPage = 1; currentPage < numberOfPages; currentPage++) {
//         const circulator: number = currentPage % concurrency;
//         if(sequences[circulator] !== undefined) {
//             sequences[circulator] = sequences[circulator]!
//             .then(() => {
//                 navigation.resetFilter((res: puppeteer.HTTPResponse) => 
//                     // TODO: filterUrl = "https:....?p=${i}"となるURLにすること
//                     res.status() === 200 && res.url() === filterUrl
//                 );
                
//                 // TODO: awaitのエラーはthne()のハンドラ関数がasyncじゃないから
//                 // あとで分離するので一旦awaitのままで

//                 // i番目のページへアクセスする(Navigationはひとつでいいのか？sequence毎でいいのか？)
//                 const responces: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(pageInstances[circulator]!, pageInstances[circulator]!.goto(filterUrl));
    
//                 // filterUrlに対するHTTPResponseを取得する
//                 // HTTPResponseからデータを取得する
//                 const illustMangaDataElements: iIllustMangaDataElement[] = retrieveDeepProp<iIllustMangaDataElement[]>(["body", "illustManga", "data"], (await responces.shift().json()) as iBodyIncludesIllustManga); 
//                 // データからほしい情報をollectedへ格納する
//                 collector.resetData(illustMangaDataElements);
//                 collectedIds = [...collectedIds, ...collector.execute("id")];
//             });
//         }
//         else {
//             console.error("RangeError: Accessing out range of array.");
//         }
//     }

//     return sequences;

//     // finallyで必ず新規作成したpageインスタンスをcloseすること
//     // となるとclassにしたほうがいいかも
// };