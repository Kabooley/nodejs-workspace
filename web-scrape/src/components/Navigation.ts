/**********************************************************************
 * TODO: trigger()として受け入れる関数の型が通るように修正
 * ********************************************************************/ 
import type puppeteer from 'puppeteer';

// Default options for page.waitForNavigation()
const defaultOptions: puppeteer.WaitForOptions = { waitUntil: ["load", "domcontentloaded"]};

/****
 * Navigation class
 * 
 * @constructor
 * @param {puppeteer.Page} page - puppeteer page instance.
 * @param {() => Promise<any>} trigger - Asychronous function taht triggers navigation.
 * @param {puppeteer.WaitForOptions} [options] - Options for page.waitForNavigation.
 * */ 
export class Navigation {
    private tasks: (() => Promise<void>)[];
    private waitForNavigation: Promise<puppeteer.HTTPResponse | null>;
    constructor(
        page: puppeteer.Page, 
        private trigger: () => Promise<any>,
        options?: puppeteer.WaitForOptions
        ) {
            this.waitForNavigation = page.waitForNavigation(options ? options : defaultOptions);
            this.tasks = [];
            this.push = this.push.bind(this);
            this.navigate = this.navigate.bind(this);
            this._executeTasks = this._executeTasks.bind(this);
    };

    push(task: () => Promise<any>): void {
        this.tasks.push(task);
    };

    // Actually this is not totally private method at all.
    // Optionally tasks execution just after trigger called.
    async _executeTasks(): Promise<any[]> {
        let result: any[] = [];
        for(const task of this.tasks) {
            const r = await task;
            result.push(r);
        } 
        return result;
    };

    // Navigate to next page.
    async navigate(): Promise<(puppeteer.HTTPResponse | any)[]> {
        await this.trigger();
        const rest: any[] = await this._executeTasks();
        const res: puppeteer.HTTPResponse | null = await this.waitForNavigation;
        return [...rest, res];
    };
}


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