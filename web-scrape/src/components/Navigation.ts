/**********************************************************************
 * Navigation class:
 * 
 * TODO: puppeteer.Pageをコンストラクタ引数に取るようにしなくていいようにする。
 * 
 * プロミスだけ取得できればいいので。
 * ********************************************************************/ 
import type puppeteer from 'puppeteer';

// Default settings for page.waitFor methods
const defaultOptions: puppeteer.WaitForOptions = { waitUntil: ["load", "domcontentloaded"]};
const defaultWaitForResponseCallback = function(res: puppeteer.HTTPResponse) { return res.status() === 200;};

/****
 * Navigation class
 * 
 * @constructor
 * @param {puppeteer.Page} page - puppeteer page instance.
 * @param {() => Promise<any>} trigger - Asychronous function taht triggers navigation.
 * @param {puppeteer.WaitForOptions} [options] - Options for page.waitForNavigation.
 * 
 * 
 * Usage:
 * ```
 * navigate.resetWaitForResponse(page.waitForResponse(...));
 * navigate.resetWaitForNavigation(page.waitForNavigation(...));
 * navigate.push([...taskPromises]);
 * const [responses] = await navigate(function() {return page.click(".button");});
 * const [responses] = await navigateBy(function() {return page.click(".button");});
 * const [responses] = await navigateBy(function() {return page.keyboard.press("Enter");});
 * // Page transition has been completed...
 * ```
 * 
 * */ 
export class Navigation {
    private tasks: Promise<any>[];
    private waitForNavigation: Promise<puppeteer.HTTPResponse | null>;
    private waitForResponse: Promise<puppeteer.HTTPResponse>;
    constructor(
        page: puppeteer.Page
        ) {
            this.waitForNavigation = page.waitForNavigation(defaultOptions);
            this.waitForResponse = page.waitForResponse(defaultWaitForResponseCallback);
            this.tasks = [];
            this.push = this.push.bind(this);
            this.navigateBy = this.navigateBy.bind(this);
            this.navigate = this.navigate.bind(this);
    };

    push(task: Promise<any>): void {
        this.tasks.push(task);
    };

    resetWaitForResponseCallback(cb: Promise<puppeteer.HTTPResponse>): void {
        this.waitForResponse = cb;
    };

    resetWaitForNavigation(p: Promise<puppeteer.HTTPResponse | null>): void {
        this.waitForNavigation = p;
    };

    /******
     * Navigate by trigger and execute tasks.
     * 
     * 
     * */ 
    async navigate(trigger: () => Promise<void>): Promise<(puppeteer.HTTPResponse | any)[]> {
        return await Promise.all([
            ...this.tasks,
            this.waitForResponse,
            this.waitForNavigation,
            trigger()
        ]);
    };

    /***
     * Bit faster than navigate()
     * navigate()とほぼ変わらないし影響もしないからいらないかも。
     * */ 
    async navigateBy(trigger: () => Promise<void>): Promise<(puppeteer.HTTPResponse | any)[]> {
        return await Promise.all([
            this.waitForResponse,
            this.waitForNavigation,
            trigger()
        ]);
    };
};


// export class Navigation {
//     private tasks: (() => Promise<void>)[];
//     private waitForNavigation: Promise<puppeteer.HTTPResponse | null>;
//     constructor(
//         page: puppeteer.Page, 
//         private trigger: () => Promise<any>,
//         options?: puppeteer.WaitForOptions
//         ) {
//             this.waitForNavigation = page.waitForNavigation(options ? options : defaultOptions);
//             this.tasks = [];
//             this.push = this.push.bind(this);
//             this.navigate = this.navigate.bind(this);
//             this._executeTasks = this._executeTasks.bind(this);
//     };

//     push(task: () => Promise<any>): void {
//         this.tasks.push(task);
//     };

//     // Actually this is not totally private method at all.
//     // Optionally tasks execution just after trigger called.
//     async _executeTasks(): Promise<any[]> {
//         let result: any[] = [];
//         for(const task of this.tasks) {
//             const r = await task;
//             result.push(r);
//         } 
//         return result;
//     };

//     // Navigate to next page.
//     async navigate(): Promise<(puppeteer.HTTPResponse | any)[]> {
//         await this.trigger();
//         const rest: any[] = await this._executeTasks();
//         const res: puppeteer.HTTPResponse | null = await this.waitForNavigation;
//         return [...rest, res];
//     };
// }


// 
// --- USAGE OF Navigation class
// 
// async function clickNextButton(page) {
//     return await page.click("button.nextPage");
// }
// async function captureResponse(page) {
//     return page.waitForResponse((res) => {
//         res.status === 200;
//     });
// }
// const navigation = new Navigation(page, clickNextButton);
// navigation.push(captureResponse);
// const [res, ...rest] = await navigation.navigate();

// --- LEGACY ---
// 
// 
// interface iOptionNavigateToNextPage {
//     waitForResponseCallback?: ((res: puppeteer.HTTPResponse) => boolean | Promise<boolean>);
//     navigationOptions?: puppeteer.WaitForOptions;
// };

// const defaultWaitForResponseCallback = (res: puppeteer.HTTPResponse): boolean => {
//     return res.status() === 200;
// };

// const defaultNavigationOption: puppeteer.WaitForOptions = {
//     waitUntil: ["load", "domcontentloaded"]
// };
// 
// /******
//  * Navigate to next page and returns HTTP Response.
//  * 
//  * @param {() => Promise<void>} trigger - Function that triggers page transition.
//  * @param {iOptionNavigateToNextPage} [options] - Optional parameters 
//  * @return {Promise<puppeteer.HTTPResponse>} - HTTP Response waitForResponse() has been returned.
//  * 
//  * Trigger navigation by firing trigger(), get HTTP Response, wait for navigation has been done.
//  * */ 
//  export const navigateToNextPage = async (
//     page: puppeteer.Page, 
//     trigger: () => Promise<void>,
//     options? : iOptionNavigateToNextPage
// ): Promise<puppeteer.HTTPResponse> => {
// try {
//     let cb: ((res: puppeteer.HTTPResponse) => boolean | Promise<boolean>) = defaultWaitForResponseCallback;
//     let navOption: puppeteer.WaitForOptions = defaultNavigationOption;
//     if(options){
//         const { waitForResponseCallback, navigationOptions } = options;
//         cb = waitForResponseCallback ? waitForResponseCallback : cb;
//         navOption = navigationOptions ? navigationOptions : navOption;
//     }
//     const waitForNextResultResponse = page.waitForResponse(cb);
//     const waitForNextPageLoad = page.waitForNavigation(navOption);

//     // Triggers navigation to next page.
//     await trigger();
//     // Capture response of next page request.
//     const r: puppeteer.HTTPResponse = await waitForNextResultResponse;
//     await waitForNextPageLoad;
//     return r;
// }
// catch(e) {
//     throw e;
// }
// };