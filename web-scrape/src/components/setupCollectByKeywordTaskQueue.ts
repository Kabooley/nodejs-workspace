/******************************************************************
 * `collect byKeyword` command task genearation.
 * 
 * `collect byKeyword` commandに基づく一連の処理を逐次処理として組み立てる。
 * 
 * 最終的にTaskQueue::sequentialAsyncTasks()へtasks:iSequentialAsyncTask[]として渡されて
 * そこでpromiseチェーン化される。
 * なのでここではtasksを生成する。
 * 
 * Promiseチェーンからなる逐次処理に、
 * あらかじめ定められているタスクを追加していく。
 * 逐次処理のPromiseチェーンが組み立てられたらそのPromiseを返す。
 * 
 * task:
 * - fill search form by keyword
 * - navigate to keyword search result page
 * - get its http response
 * - parse its http response
 * - generate collecting process
 * - return collected data
 *  
 * 
 * TODO:
 * - エラーハンドリング
 * - `then(() => foo().then(() => bar()))`という使い型は問題がないかのか検証
 * - 機能の分割（1ファイル1機能を守る）
 * 
 * NOTE:
 * - 検索結果ページから取得するのはiIllustMangaDataElement型データの`id`プロパティであるとハードコーディングしている
 * ****************************************************************/ 
import type puppeteer from 'puppeteer';
import type { iSequentialAsyncTask } from '../utilities/TaskQueue';
import type { iIllustMangaDataElement, iIllustManga, iBodyIncludesIllustManga } from '../constants/illustManga';
import type { iFilterLogic  } from './Collect';
import type { iCollectOptions } from '../commandParser/commandModules/collectCommand';
import { search } from './search';
import { Navigation } from './Navigation';
import { Collect } from './Collect';
import { AssembleParallelPageSequences } from './AssembleParallelPageSequences';
import { retrieveDeepProp } from '../utilities/objectModifier';
import array from '../utilities/array';
import mustache from '../utilities/mustache';

let tasks: iSequentialAsyncTask[] = [];
const key: keyof iIllustMangaDataElement = "id";
const url: string = "https://www.pixiv.net/tags/{{keyword}}/artworks?p={{i}}&s_mode=s_tag";
const filterUrl: string = "https://www.pixiv.net/ajax/search/artworks/{{keyword}}?word={{keyword}}&order=date_d&mode=all&p={{i}}&s_mode=s_tag&type=all&lang=ja";

type iResponsesResolveCallback<T> = (params: any) => T[] | Promise<T[]>;

/***
 * Command `collectbyKeyword`'s options will be stored.
 * 
 * */ 
const optionsProxy = (function() {
    let options = {} as iCollectOptions;
    return {
        set: function(v: iCollectOptions) {
            options = {
                ...options, ...v
            };
        },
        get: function() {
            return options;
        }
    };
})();


/***
 * 
 * 
 * */ 
const resolver: iResponsesResolveCallback<iIllustMangaDataElement> = async (responses: (puppeteer.HTTPResponse | any)[]) => {
    const response = await responses.shift().json() as iBodyIncludesIllustManga;
    const resolved: iIllustMangaDataElement[] = retrieveDeepProp<iIllustMangaDataElement[]>(["body", "illustManga", "data"], response);
    if(resolved === undefined) throw new Error("");
    return resolved;
};

/***
 * filterLogic for AssembleParallelPageSequences.filter() function.
 * 
 * Apropriates for iCollectOptions.
 * */ 
const filterLogic: iFilterLogic<iIllustMangaDataElement> = (e: iIllustMangaDataElement) => {
    let result: boolean = true;
    const options = optionsProxy.get();

    // うまい方法見つからんので、
    // iCollectOptionsのbookmarkOver以外のプロパティが指定してあれば
    // ここでハードコーディングで検査機能を追記する
    if(options.tags !== undefined && e['tags'] !== undefined) {
        result = result && array.includesAll(e['tags'], options.tags);
    }
    if(options.userName !== undefined && e['userName'] !== undefined) {
        result = result && (e['userName'] === options.userName);
    }
    return result;
};



/***
 * Generate AssembleParallelPageSequences<iIllustMangaDataElement> instance.
 * 
 * */ 
const assemblingCollectProcess = async (
    browser: puppeteer.Browser, numberOfProcess: number, numberOfPages: number
    // ): Promise<AssembleParallelPageSequences<iIllustMangaDataElement>> => {
    ) => {

                
        // DEBUG:
        console.log("assemblingCollectProcess()");


    // NOTE: Code outside of try block is for catch block to scope instance.
    const assembler = new AssembleParallelPageSequences<iIllustMangaDataElement>(
        browser, numberOfProcess, new Navigation(), new Collect<iIllustMangaDataElement>()
    );
    try {
        await assembler.initialize();
        assembler.setResponsesResolver(resolver);

        // DEBUG:
        console.log("generating assembler parallel process...");
        
        for(let currentPage = 1; currentPage <= numberOfPages; currentPage++) {
            const circulator: number = currentPage % numberOfProcess;
            if(assembler.getSequences()[circulator] !== undefined
                && assembler.getPageInstance(circulator) !== undefined
            ) {
                const page = assembler.getPageInstance(circulator)!;
                assembler.setResponseFilter(
                    (res: puppeteer.HTTPResponse) => 
                        res.status() === 200 
                        && res.url() === mustache(filterUrl, {keyword: encodeURIComponent(optionsProxy.get().keyword), i: currentPage})
                );

                assembler.getSequences()[circulator] = assembler.getSequences()[circulator]!

                // DEBUG:
                .then(() => console.log(`Running Instance and Sequence: ${circulator} currentPage: ${currentPage}`))

                .then(() => assembler.navigation.navigateBy(page, page.goto(mustache(url, {keyword: encodeURIComponent(optionsProxy.get().keyword), i:currentPage}), { waitUntil: ["load", "networkidle2"]})))
                .then((responses: (puppeteer.HTTPResponse | any)[]) => assembler.resolveResponses!(responses))
                // DEBUG: 12/02 refactored.
                // 
                // .then((data: iIllustMangaDataElement[]) => assembler.filter(data, key, filterLogic))
                .then(
                    (data: iIllustMangaDataElement[]) => assembler.collect(assembler.filter(data, filterLogic), key)
                )
                .catch((e) => assembler.errorHandler(e))
            }
        };
        
        // DEBUG:
        console.log("generating has been done.");


        // assemblerを外に出すのが面倒なのでここですべて必要なプロミスチェーンを呼び出す。
        // NOTE: プロミスの入れ子は外のプロミスチェーンのエラーを捕捉しないのでfinally()が必要な時に発火しない可能性がある
        // 
        // TYPE of this retuned value is 
        // (keyof iIllustaMangaDataElement: illustaMangaDataElement[keyof iIllustaMangaDataElement])[]
        return assembler.run().then(() => assembler.getResult()).catch(e => assembler.errorHandler(e)).finally(() => assembler.finally());

    }
    catch(e) {
        assembler.finally();
        throw e;
    }
};

/***
 * Get http response body data and decides how many process (page instances) should be generated.
 * 
 * */
const decideNumberOfProcess = (illustManga: iIllustManga) => {
            
        // DEBUG:
        console.log("Decide number of process...");

    const { data, total } = illustManga;
    // 検索結果の全ページ数
    const numberOfPages: number = Math.floor(total / data.length);
    let numberOfProcess: number = 1;

    if(numberOfPages >= 20 && numberOfPages < 50) {
        numberOfProcess = 2;
    }
    else if(numberOfPages >= 50 && numberOfPages < 100) {
        numberOfProcess = 5;	
    }
    else if(numberOfPages >= 100) {
        numberOfProcess = 10;
    }
    else {
        numberOfProcess = 1;
    };

    
        // DEBUG:
        console.log(`number of process: ${numberOfProcess}, number of pages: ${numberOfPages}`);

    return {
        numberOfProcess: numberOfProcess, 
        numberOfPages: numberOfPages
    };

    // return assemblingCollectProcess(browser, numberOfProcess, numberOfPages);
};

/****
 * Set up tasks which required by "collectByKeyword" command and return tasks.
 * The tasks are sequential
 * 
 * */ 
export const setupCollectByKeywordTaskQueue = (
    browser: puppeteer.Browser,
    page: puppeteer.Page, 
    options: iCollectOptions
    ) => {
    // DEBUG:
    console.log("setupCollectByKeywordTaskQueue()");

    optionsProxy.set(options);

    // setting up task queue.
    // 
    // 1. fill search form with keyword.
    tasks.push(() => search(page, optionsProxy.get().keyword));
    // 2. Navigate to keyword search result page.
    tasks.push(() => {

        // DEBUG:
        console.log("Navigate to search result page...");

        const navigation = new Navigation();
        navigation.resetFilter((res: puppeteer.HTTPResponse) => 
            res.status() === 200 
            // 
            // TODO: どうやらこのＵＲＬは無効みたいだ...
            // 
            // && res.url() === mustache("https://www.pixiv.net/ajax/search/artworks/${{keyword}}?word=${{keyword}}", {keyword: encodeURIComponent(optionsProxy.get().keyword)})
            && res.url() === mustache(filterUrl, {keyword: encodeURIComponent(optionsProxy.get().keyword), i: 1})
        );
        navigation.resetWaitForOptions({waitUntil: ["load", "networkidle2"]});
        return navigation.navigateBy(page, page.keyboard.press('Enter'))
    });
    // 3. Check the response includes required data.
    tasks.push((res: (puppeteer.HTTPResponse | any)[]) => res.shift().json() as iBodyIncludesIllustManga);
    // 4. Resolve HTTPResponse body to specific type.
    /***
     * errorをスローしているけれど、then()ハンドラは同期関数なのでOK
     * 
     * */ 
    tasks.push((responseBody: iBodyIncludesIllustManga): iIllustManga => {
                
        // DEBUG:
        console.log("Resolving navigation http response body...");

        const resolved = retrieveDeepProp<iIllustManga>(["body", "illustManga"], responseBody);
        if(resolved === undefined) throw new Error("");
        return resolved;
    })
    // 5. Define numberOfProcess according to number of result. 
    tasks.push(decideNumberOfProcess);
    // 5. setup collect process according to number of process.
    // 
    // NOTE: 11/28 Also collect process will be run in this handler
    tasks.push((p: {numberOfProcess: number, numberOfPages: number}) => 
        assemblingCollectProcess(browser, p.numberOfProcess, p.numberOfPages));
    // 6. run assembled sequences.

    // NOTE: 11/28 修正内容のテストの為コメントアウト
    // tasks.push(
    //     (assembler: AssembleParallelPageSequences<iIllustMangaDataElement>) => {
    //         // DEBUG:
    //         console.log("START COLLECTING PROCESS...");

    //         return assembler.run()
    //         // TODO: finally呼出しているからこのthen()呼出は意味ないかも...
    //         .then(() => assembler.getResult())
    //         .catch(e => assembler.errorHandler(e))
    //         .finally(() => {
                
    //             // DEBUG:
    //             console.log("END COLLECTING PROCESS...");

    //             assembler.finally();
    //         })}
    // );

    return tasks;
};
