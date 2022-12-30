/******************************************************************
 * `collect byKeyword`で実行するべき内容のうち、
 * キーワード検索結果すべてから各artworkのidを取得するプロセスを
 * 構築する。
 * 
 * Process:
 * - Fill search form with keyword option.
 * - Navigate to result
 * - Get search result from HTTP Response.
 * - Analyse HTTP Response body to decide number of process to do.
 * - Set up each processes.
 * - Run processes parallelly.
 * ****************************************************************/ 
import type puppeteer from 'puppeteer';
import type { iSequentialAsyncTask } from '../../utilities/TaskQueue';
import type { iIllustManga, iBodyIncludesIllustManga } from '../../constants/illustManga';
import { search } from '../search';
import { Navigation } from '../Navigation';
import { retrieveDeepProp } from '../../utilities/objectModifier';
import { decideNumberOfProcess } from './decideNumberOfProcess';
import mustache from '../../utilities/mustache';
import { setupParallelSequences } from './setupParallelSequences';
/**
 * TODO: iPartialOptionsにすべきか、iPartialOptionsにすべきかまだ定かでない
 * 
 * */ 
import type { iPartialOptions } from '../../commandParser/commandTypes';

let tasks: iSequentialAsyncTask[] = [];
const filterUrl: string = "https://www.pixiv.net/ajax/search/artworks/{{keyword}}?word={{keyword}}&order=date_d&mode=all&p={{i}}&s_mode=s_tag&type=all&lang=ja";

/**
 * Command options will be stored.
 * */ 
const optionsProxy = (function() {
    let options = {} as iPartialOptions;
    return {
        set: function(v: iPartialOptions) {
            options = {
                ...options, ...v
            };
        },
        get: function() {
            return options;
        }
    };
})();


/****
 * Set up tasks which required by "collectByKeyword" command and return tasks.
 * The tasks are sequential
 * 
 * */ 
export const setupCollectByKeywordTaskQueue = (
    browser: puppeteer.Browser,
    page: puppeteer.Page, 
    options: iPartialOptions
    ): iSequentialAsyncTask[] => {

    // DEBUG:
    console.log("setupCollectByKeywordTaskQueue(): start");

    // NOTE: keywordは必須のはずなので
    if(options.keyword === undefined) throw new Error("Command option `keyword` is necessary but there is no such value.");

    optionsProxy.set(options);

    // setting up task queue.
    // 
    // 1. fill search form with keyword.
    tasks.push(() => search(page, optionsProxy.get().keyword!));
    // 2. Navigate to keyword search result page.
    tasks.push(setupNavigation);
    tasks.push((navigation: Navigation) => navigation.navigateBy(page, page.keyboard.press('Enter')));
    // 3. Check the response includes required data.
    tasks.push((res: (puppeteer.HTTPResponse | any)[]) => res.shift().json() as iBodyIncludesIllustManga);
    // 4. Resolve HTTPResponse body to specific type.
    tasks.push(resolve);
    // 5. Define numberOfProcess according to number of result. 
    tasks.push(decideNumberOfProcess);
    // 6. setup collect process according to number of process.
    tasks.push((p: {numberOfProcess: number, numberOfPages: number}) => 
        setupParallelSequences(browser, p.numberOfProcess, p.numberOfPages, optionsProxy.get()));
    return tasks;
};

/**
 * setupCollectByKeywordTaskQueue()で呼び出されるtaskの一つ。
 * Navigationの準備をする。
 * */ 
const setupNavigation = (): Navigation => {

    // DEBUG:
    console.log("setupNavigation(): Navigate to result page of keyword search...");

    const navigation = new Navigation();
    navigation.resetFilter((res: puppeteer.HTTPResponse) => 
        res.status() === 200 
        && res.url() === mustache(filterUrl, {keyword: encodeURIComponent(optionsProxy.get().keyword!), i: 1})
    );
    navigation.resetWaitForOptions({waitUntil: ["load", "networkidle2"]});
    return navigation;
};


/**
 * setupCollectByKeywordTaskQueue()で呼び出されるtaskの一つ。
 * Navigationの戻り値からiIllustManga[]ヲ取り出して返す。 
 * */ 
const resolve = (responseBody: iBodyIncludesIllustManga): iIllustManga => {
                
    // DEBUG:
    console.log("resolve(): Resolving navigation http response body...");
    console.log(responseBody);

    const resolved = retrieveDeepProp<iIllustManga>(["body", "illustManga"], responseBody);
    // このthen()ハンドラは同期関数なのでスローは補足される
    if(resolved === undefined) throw new Error("");
    return resolved;
}