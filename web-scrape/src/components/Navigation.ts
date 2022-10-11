/**********************************************************************
 * Navigation class:
 * 
 * TODO: Navigationはpageインスタンスに因らないようにしたい: 直したのでテスト
 * TODO: puppeteer.Pageをコンストラクタ引数に取るようにしなくていいようにする。
 * TODO: navigateBy()などのナビゲートメソッドはURLを受け取るようにする
 * TODO: navigateBy()などのナビゲートメソッドの引数triggerをプロミスにする
 * 
 * プロミスだけ取得できればいいので。
 * ********************************************************************/ 
import type puppeteer from 'puppeteer';

// Default settings for page.waitFor methods
const defaultOptions: puppeteer.WaitForOptions = { waitUntil: ["load", "domcontentloaded"]};
const defaultWaitForResponseFilter = function(res: puppeteer.HTTPResponse) { return res.status() === 200;};


/***
 * 
 * 
 * UPDATED: 2022/10/11
 * Refactored that Navigation is able to run without Page instance.
 * Page instance is only required when run navigate() or navigateBy().
 * 
 * */ 
export class Navigation {
    private tasks: Promise<any>[];
    private waitForOptions: puppeteer.WaitForOptions;
    private filter: (res: puppeteer.HTTPResponse) => boolean | Promise<boolean>;
    constructor() {
            this.waitForOptions = defaultOptions;
            this.filter = defaultWaitForResponseFilter;
            this.tasks = [];
            this.push = this.push.bind(this);
            this.navigateBy = this.navigateBy.bind(this);
            this.navigate = this.navigate.bind(this);
    };

    push(task: Promise<any>): void {
        this.tasks.push(task);
    };

    resetFilter(filter: (res: puppeteer.HTTPResponse) => boolean | Promise<boolean>) {
        this.filter = filter;
    }

    resetWaitForOptions(options: puppeteer.WaitForOptions) {
        this.waitForOptions = options;
    }

    /******
     * Navigate by trigger and execute tasks.
     * 
     * 
     * */ 
     async navigate(page: puppeteer.Page, trigger: Promise<any>): Promise<(puppeteer.HTTPResponse | any)[]> {
        return await Promise.all([
            ...this.tasks,
            page.waitForResponse(this.filter),
            page.waitForNavigation(this.waitForOptions),
            trigger
        ]);
    };

    /***
     * navigate that doesn't run `this.tasks`.
     * */ 
    async navigateBy(page: puppeteer.Page, trigger: Promise<any>): Promise<(puppeteer.HTTPResponse | any)[]> {
        return await Promise.all([
            page.waitForResponse(this.filter),
            page.waitForNavigation(this.waitForOptions),
            trigger
        ]);
    };
};
// 一時的に退避。
// Navigationをpageインスタンスに因らないように作り変えてみる
// 
// /****
//  * Navigation class
//  * 
//  * @constructor
//  * @param {puppeteer.Page} page - puppeteer page instance.
//  * @param {() => Promise<any>} trigger - Asychronous function taht triggers navigation.
//  * @param {puppeteer.WaitForOptions} [options] - Options for page.waitForNavigation.
//  * 
//  * 
//  * Usage:
//  * ```
//  * navigate.resetWaitForResponse(page.waitForResponse(...));
//  * navigate.resetWaitForNavigation(page.waitForNavigation(...));
//  * navigate.push([...taskPromises]);
//  * const [responses] = await navigate(function() {return page.click(".button");});
//  * const [responses] = await navigateBy(function() {return page.click(".button");});
//  * const [responses] = await navigateBy(function() {return page.keyboard.press("Enter");});
//  * // Page transition has been completed...
//  * ```
//  * 
//  * */ 
// export class Navigation {
//     private tasks: Promise<any>[];
//     private waitForNavigation: Promise<puppeteer.HTTPResponse | null>;
//     private waitForResponse: Promise<puppeteer.HTTPResponse>;
//     constructor(
//         page: puppeteer.Page
//         ) {
//             this.waitForNavigation = page.waitForNavigation(defaultOptions);
//             this.waitForResponse = page.waitForResponse(defaultWaitForResponseCallback);
//             this.tasks = [];
//             this.push = this.push.bind(this);
//             this.navigateBy = this.navigateBy.bind(this);
//             this.navigate = this.navigate.bind(this);
//     };

//     push(task: Promise<any>): void {
//         this.tasks.push(task);
//     };

//     resetWaitForResponseCallback(cb: Promise<puppeteer.HTTPResponse>): void {
//         this.waitForResponse = cb;
//     };

//     resetWaitForNavigation(p: Promise<puppeteer.HTTPResponse | null>): void {
//         this.waitForNavigation = p;
//     };

//     /******
//      * Navigate by trigger and execute tasks.
//      * 
//      * 
//      * */ 
//     async navigate(trigger: () => Promise<void>): Promise<(puppeteer.HTTPResponse | any)[]> {
//         return await Promise.all([
//             ...this.tasks,
//             this.waitForResponse,
//             this.waitForNavigation,
//             trigger()
//         ]);
//     };

//     /***
//      * Bit faster than navigate()
//      * navigate()とほぼ変わらないし影響もしないからいらないかも。
//      * 
//      * 10/2: trigger: () => Promise<void>をtrigger: () => Promise<any>にした
//      * */ 
//     async navigateBy(trigger: () => Promise<any>): Promise<(puppeteer.HTTPResponse | any)[]> {
//         return await Promise.all([
//             this.waitForResponse,
//             this.waitForNavigation,
//             trigger()
//         ]);
//     };
// };
