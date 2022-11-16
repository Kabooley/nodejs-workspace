/*******************************************************
 * 検索結果全ページから指定のデータを取得するクラス
 * 
 * 基本的な流れを守ればあとはほぼカスタマイズ可能な並列処理を定義できる
 * sequenceの逐次処理：
 * 1. Prepare to navigate
 * 2. Navigate
 * 3. Solve returned HTTPResponses from Navigate process
 * 4. Collect data from returned value from solving http response process
 * 5. Error handling
 * 
 * 問題：
 * - Solveの段階でどんなデータをとるのかは場合に因るのでハードコーディングはできない
 * 取得できたHTTPResponseのどの深度のプロパティが必要なのかとか,
 * HTTPResponseはjson()で解決するのかtext()で解決するのかも固定できない。
 * 
 * - Navigateの段階でどのpageインスタンスを
 * *****************************************************/ 
import type puppeteer from 'puppeteer';
import type { iIllustMangaDataElement, iBodyIncludesIllustManga } from '../constants/illustManga';
import { Collect } from './Collect';
import { Navigation} from './Navigation';
import { retrieveDeepProp } from '../utilities/objectModifier';
import mustache from '../utilities/mustache';

// TEMPORARY GLOABL
const url: string = "https://www.pixiv.net/tags/{{keyword}}/artworks?p={{i}}&s_mode=s_tag";
const filterUrl: string = "https://www.pixiv.net/ajax/search/artworks/{{keyword}}?word={{keyword}}&order=date_d&mode=all&p={{i}}&s_mode=s_tag&type=all&lang=ja";

type iResponsesResolver<TO> = (responses: (puppeteer.HTTPResponse | any)[]) => TO | Promise<TO>;

/****
 * What if Navigation instance was passed as constructor paremeter?
 * What if Collect instacen was pased as constructor parameter?
 *  Then I don't need to mind about the type of data?
 * 
 * 
 * @type {T} - The type of `collected` variable.
 * 
 * pageインスタンスからのHTTPResponseから指定のデータを抽出してcollectedへ納める
 * という仕事を遂行するためのclass
 * 
 * なので次の部分はハードコーディングになるかも:
 * pageインスタンスを持つ
 * ジェネリクスで型指定されたcollected変数
 * 
 * */ 
// T: might be `iIllustMangaDataElement`
export class CollectResultPage<T> {
    pageInstances: puppeteer.Page[] = [];
    sequences: Promise<void>[] = [];
    concurrency: number;
    collected: T[];
    keyword: string;
    responsesResolver: iResponsesResolver<T>;
    loopIterator: number;
    circulator: number;
    constructor(
        private browser: puppeteer.Browser, 
        concurrency: number,  
        keyword: string,
        public navigation: Navigation,
        public collector: Collect<T>
        ){
        this.concurrency = concurrency;
        this.collector = new Collect<T>();
        this.collected = [];
        this.keyword = keyword;
        this.responsesResolver = null;
        this.loopIterator = 0;
        this.circulator = 0;
    };

    async _generatePageInstances() {
        return this.pageInstances.push(await this.browser.newPage());
    };

    _initializeSequences() {
        return this.sequences.push(Promise.resolve());
    };


    _resolveJson(responses: (puppeteer.HTTPResponse | any)[]) {
        return responses.shift().json() as iBodyIncludesIllustManga;
    };


    // -- PUBLIC METHODS --

    /***
     * Generate new instances according to this.concurrency
     * - Generate page instances.
     * - Generate sequence instances.
     * 
     * NOTE: DO NOT DO ANYTHING BEFORE CALL THIS initialize().
     * */ 
    async initialize() {
        for(let i = 0; i < this.concurrency; i++) {
            await this._generatePageInstances();
            this._initializeSequences();
        };
    };
    

    resetResponseFilter(filter: (res: puppeteer.HTTPResponse) => boolean | Promise<boolean>) {
        this.navigation.resetFilter(filter);
    };

    /****
     * 
     * Call this method everyloop that updates sequences 
     * to update iterator of loop.
     * 
     * */ 
    updateIterates(i: number) {
        this.loopIterator = i;
    }
    
    
    setResponsesResolver<T>(callback: iResponsesResolver<T>) {
        this.responsesResolver = callback;
    };
    
    /****
     * navigation.navigateBy()で遷移するのは固定なので引数は固定である
     * 
     * responses --> resolver --> ValueYouWant or error
     * 
     * 1: responses.shift() or response.pop()など
     * 2: 1.json() or 1.text()など
     * 3: どのプロパティか、どの深度かにあるプロパティを何とかして取得する
     * 4: 取得で来たらそれを返す、または取得できなかったらエラーを返す
     * 
     * */ 
     resolveResponses(responses: (puppeteer.HTTPResponse | any)[]) {
        return this.responsesResolver(responses);
    }

    collect(data: T[], key: keyof T) {
        this.collector.resetData(data);
        this.collected = [...this.collected, ...this.collector.execute(key)]
    };

    run(): Promise<void[]> {
        return Promise.all(this.sequences);
    }

    getResult(): T[] {
        return this.collected;
    }

    // finally() will not be invoked automatically.
    // But this method must be called after all process is done.
    finally() {
        // DEBUG:
        console.log("finally(): acquireFromResultPage.ts");

        if(this.sequences.length > 0) {
            this.sequences = [];
        }
        if(this.pageInstances.length > 0) {
            // NOTE: awaitで待つ必要がないのでp.close()は同期的な呼び出し
            this.pageInstances.forEach(p => p.close());
            this.pageInstances = [];
        }
        if(this.browser !== undefined){
            this.browser = undefined;
        }
    };


    
    // generateTasks(amountOfTasks: number) {
    //     for(let i = 1; i <= amountOfTasks; i++) {
    //         // Circulates 1 ~ amountOfTasks
    //         const circulator: number = i % this.concurrency;
    //         if(
    //             this.sequences[circulator] !== undefined 
    //             && this.pageInstances[circulator] !== undefined
    //         ) {
    //             this.sequences[circulator] = this.sequences[circulator]!
    //             // Update the filter url everytime loop.
    //             // ここはこのままでもいいかも
    //             // 
    //             .then(() => 
    //                 this.resetResponseFilter((res: puppeteer.HTTPResponse) => res.status() === 200 && res.url() === mustache(filterUrl, {keyword: encodeURIComponent(this.keyword), i: i}))
    //             )
    //             // navigate to the url.
    //             .then(() => this.navigation.navigateBy(
    //                 this.pageInstances[circulator]!, 
    //                 this.pageInstances[circulator]!.goto(mustache(url, {keyword: encodeURIComponent(this.keyword), i: i}))
    //             ))
    //             // retrieve data from http reponses from filter url.
    //             // this then() returns iBodyIncludesIllustManga.
    //             .then(this._resolveJson)
    //             // retrieve data from http response
    //             .then((responseBody: iBodyIncludesIllustManga) => this._retrieveDataFromResponse(["body", "illustManga", "data"], responseBody))
    //             // Contains the data
    //             .then((data: T[]) => {
    //                 if(data === undefined) throw new Error("Error: Could not retrieve data from http response. @acquireFromResultPage");
    //                 this._collect(data, "id");
    //             })
    //             // Error handling.
    //             .catch(e => {

    //             });
    //         }
    //         else {
    //             console.error("RangeError: Accessing out range of array.");
    //         }
    //     }
    //     return this.sequences;
    // }
    

    // _retrieveDataFromResponse(responseBody: object, propOrder: string[]) {
    //     // TODO: FIX: Genericsの型付けがハードコーディングである
    //     // TODO: FIX: retrieveDeepPropの第一引数がハードコーディングである
    //     return retrieveDeepProp<T[]>(propOrder, responseBody);
    // };

};

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