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
 * - 今のところ`collect byKeyword`に特化している
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
import { retrieveDeepProp } from '../utilities/objectModifier';
import { decideNumberOfProcess } from './decideNumberOfProcess';
import {assemblingResultPageCollectProcess} from './assemblingResultPageCollectProcess';
import array from '../utilities/array';
import mustache from '../utilities/mustache';

let tasks: iSequentialAsyncTask[] = [];
const filterUrl: string = "https://www.pixiv.net/ajax/search/artworks/{{keyword}}?word={{keyword}}&order=date_d&mode=all&p={{i}}&s_mode=s_tag&type=all&lang=ja";

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
            && res.url() === mustache(filterUrl, {keyword: encodeURIComponent(optionsProxy.get().keyword), i: 1})
        );
        navigation.resetWaitForOptions({waitUntil: ["load", "networkidle2"]});
        return navigation.navigateBy(page, page.keyboard.press('Enter'))
    });
    // 3. Check the response includes required data.
    tasks.push((res: (puppeteer.HTTPResponse | any)[]) => res.shift().json() as iBodyIncludesIllustManga);
    // 4. Resolve HTTPResponse body to specific type.
    tasks.push((responseBody: iBodyIncludesIllustManga): iIllustManga => {
                
        // DEBUG:
        console.log("Resolving navigation http response body...");

        const resolved = retrieveDeepProp<iIllustManga>(["body", "illustManga"], responseBody);
        // このthen()ハンドラは同期関数なのでスローは補足される
        if(resolved === undefined) throw new Error("");
        return resolved;
    })
    // 5. Define numberOfProcess according to number of result. 
    tasks.push(decideNumberOfProcess);
    // 5. setup collect process according to number of process.
    // 
    // NOTE: 11/28 Also collect process will be run in this handler
    tasks.push((p: {numberOfProcess: number, numberOfPages: number}) => 
        assemblingResultPageCollectProcess(browser, p.numberOfProcess, p.numberOfPages, optionsProxy.get()));
    // これ以降のtask追加は呼び出し側に任せる
    return tasks;
};
