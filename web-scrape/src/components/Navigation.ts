/**********************************************************************
 * Navigation class:
 * 
 * TODO: puppeteer.Pageをコンストラクタ引数に取るようにしなくていいようにする。
 * TODO: navigateBy()などのナビゲートメソッドはURLを受け取るようにする
 * TODO: navigateBy()などのナビゲートメソッドの引数triggerをプロミスにする
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
