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

const key: keyof iIllustMangaDataElement = "id";
let tasks: iSequentialAsyncTask[] = [];
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
    ): Promise<AssembleParallelPageSequences<iIllustMangaDataElement>> => {

    // NOTE: Code outside of try block is for catch block to scope instance.
    const assembler = new AssembleParallelPageSequences<iIllustMangaDataElement>(
        browser, numberOfProcess, new Navigation(), new Collect<iIllustMangaDataElement>()
    );
    try {
        await assembler.initialize();
        assembler.setResponsesResolver(resolver);

        for(let page = 1; page <= numberOfPages; page++) {
            const circulator: number = page % numberOfProcess;
            if(assembler.getSequences()[circulator] !== undefined
                && assembler.getPageInstance(circulator) !== undefined
            ) {
                const page = assembler.getPageInstance(circulator)!;
                assembler.setResponseFilter((res: puppeteer.HTTPResponse) => 
                res.status() === 200 
                && res.url() === mustache(filterUrl, {keyword: encodeURIComponent(optionsProxy.get().keyword), i: page}));

                assembler.getSequences()[circulator] = assembler.getSequences()[circulator]!
                .then(() => assembler.navigation.navigateBy(page, page.goto(mustache(url, {keyword: encodeURIComponent(optionsProxy.get().keyword), i:page}), { waitUntil: ["load", "networkidle2"]})))
                .then((responses: (puppeteer.HTTPResponse | any)[]) => assembler.resolveResponses!(responses))
                .then((data: iIllustMangaDataElement[]) => assembler.filter(data, key, filterLogic))
                .catch((e) => assembler.errorHandler(e))
            }
        };
        return assembler;
    }
    catch(e) {
        assembler.finally();
        throw new Error("Error: something went wrong. @assemblingCollectProcess");
    }
};

/***
 * Get http response body data and decides how many process (page instances) should be generated.
 * 
 * */
const decideNumberOfProcess = (illustManga: iIllustManga) => {
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
    optionsProxy.set(options);

    // setting up task queue.
    // 
    // 1. fill search form with keyword.
    tasks.push(() => search(page, optionsProxy.get().keyword));
    // 2. Navigate to keyword search result page.
    tasks.push(() => {
        const navigation = new Navigation();
        navigation.resetFilter((res: puppeteer.HTTPResponse) => 
            res.status() === 200 
            && res.url() === mustache("https://www.pixiv.net/ajax/search/artworks/${{eyword}}?word=${{eyword}}", {keyword: encodeURIComponent(optionsProxy.get().keyword)})
        );
        navigation.resetWaitForOptions({waitUntil: ["load", "networkidle2"]});
        return navigation.navigateBy(page, page.keyboard.press('Enter'))
    });
    // 3. Check the response includes required data.
    tasks.push((res: (puppeteer.HTTPResponse | any)[]) => res.shift().json() as iBodyIncludesIllustManga);
    // 4. Resolve HTTPResponse body to specific type.
    tasks.push((responseBody: iBodyIncludesIllustManga): iIllustManga => {
        const resolved = retrieveDeepProp<iIllustManga>(["body", "illustManga"], responseBody);
        if(resolved === undefined) throw new Error("");
        return resolved;
    })
    // 5. Define numberOfProcess according to number of result. 
    tasks.push(decideNumberOfProcess);
    // 5. setup collect process according to number of process.
    tasks.push((p: {numberOfProcess: number, numberOfPages: number}) => 
        assemblingCollectProcess(browser, p.numberOfProcess, p.numberOfPages));
    // 6. run assembled sequences.
    // tasks.push((assembler: AssembleParallelPageSequences<iIllustMangaDataElement>) => assembler.run());
    tasks.push((assembler: AssembleParallelPageSequences<iIllustMangaDataElement>) => assembler.run().then(() => assembler.getResult()));
    // TODO: 7. 実行結果の取得
    //  assemblerへのアクセスが必要であるがスコープ外である
    // 検証１：.then(() => assembler.run().getResult())は大丈夫か？
    // TODO: 8. エラーハンドリング
    // 検証: tasksのどこでエラーが発生してもここでキャッチできるのか？
    return tasks;
};