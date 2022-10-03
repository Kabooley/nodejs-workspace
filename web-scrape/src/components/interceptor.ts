/***************************************************
 * Intercepts HTTP Request.
 * 
 * TODO: 一度abortしたら再度傍受するためにはsetRequestInterception(true)が必要なのか確認
 * TODO: 確認次第GET 指定URLのリクエスト取得できるたびにabortする機能を実装
 * *************************************************/ 
import type puppeteer from 'puppeteer';

/**************
 * TODO: How to force event handler to check isInterceptionResolutionHanlded.
 * 
 * 
 * */ 
export class RequestInterceptor {
    private cbList: ((event: puppeteer.HTTPRequest) => void)[];
    constructor(private page: puppeteer.Page){
        this.cbList = [];
        this.run = this.run.bind(this);
        this.on = this.on.bind(this);
        this.off = this.off.bind(this);
    };

    /***
     * Call setRequestInterception to set true.
     * And add request event handler to not stall requests.
     * 
     * */ 
    async run() {
        await this.page.setRequestInterception(true);
        this.page.on("request", (r) => {
            if(r.isInterceptResolutionHandled())return;
            r.continue();
        });
    };

    /***
     * cb must include
     * `if(event.isInterceptResolutionHandled())return;`
     * */ 
    on(cb: (event: puppeteer.HTTPRequest) => void) {
        this.page.on("request", cb);
        this.cbList.push(cb);
    };

    off(cb: (event: puppeteer.HTTPRequest) => void) {
        this.page.off("request", cb);
        this.cbList.pop(cb);
    };

    removeAll()
};

// --- LEGACY -----------------------------
// 
// const setRequestInterceptor = async (page: puppeteer.Page): Promise<void> => {
//     await page.setRequestInterception(true);
//     page.on('request', (interceptedRequest: puppeteer.HTTPRequest) => {
//         if (interceptedRequest.isInterceptResolutionHandled()) return;
//         console.log("--- INTERCEPTED -----------");
//         console.log(interceptedRequest.method());
//         console.log(interceptedRequest.url());
//         console.log("----------------------------");
//         interceptedRequest.continue();
//     });
// };
