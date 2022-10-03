/***************************************************
 * Intercepts HTTP Request.
 * 
 * TODO: 一度abortしたら再度傍受するためにはsetRequestInterception(true)が必要なのか確認
 * TODO: 確認次第GET 指定URLのリクエスト取得できるたびにabortする機能を実装
 * *************************************************/ 
 import type puppeteer from 'puppeteer';

 let isInstantiated: boolean = false;

 /**************
  * TODO: How to force event handler to check isInterceptionResolutionHanlded.
  * TODO: How to create true private method.
  *   I should create closure.オブジェクトリテラルが必要になる
  * TODO: Limit the number of instances to only one.
  *   Maybe static method help this.
  *   モジュールであることを利用すればよい。
  * 
  * シングルトン・パターン：https://www.patterns.dev/posts/singleton-pattern/
  * */ 
 export class RequestInterceptor {
     private cbList: ((event: puppeteer.HTTPRequest) => void)[];
     constructor(private page: puppeteer.Page){
         // Force number of instance to only one. 
         if(isInstantiated)
            throw new Error("RequestInterceptor instance is already exists.");
         else isInstantiated = true;

         this.cbList = [];
         this.run = this.run.bind(this);
         this.on = this.on.bind(this);
         this.off = this.off.bind(this);
         this.removeAll = this.removeAll.bind(this);
     };

     static createInstance(page: puppeteer.Page) {
      return new RequestInterceptor(page);
     }
 
     /***
      * Call setRequestInterception to set true.
      * And add request event handler to not stall requests.
      * 
      * TODO: Encapsul this method.
      * */ 
     async run(): Promise<void> {
         await this.page.setRequestInterception(true);
         this.page.on("request", (r) => {
             if(r.isInterceptResolutionHandled())return;
             r.continue();
         });
     };
 
     /***
      * Add request event handler.
      * 
      * NOTE: DO NOT PASS ANONYMOUS FUNCTION
      * 
      * cb must include
      * `if(event.isInterceptResolutionHandled())return;`
      * */ 
     on(cb: (event: puppeteer.HTTPRequest) => void): void {
         this.page.on("request", cb);
         this.cbList.push(cb);
     };
 
     /***
      * Remove request event handler.
      * 
      * */   
     off(cb: (event: puppeteer.HTTPRequest) => void): void {
         this.page.off("request", cb);
         // TODO: remove specified cb from listener
         this.cbList = this.cbList.filter(registeredCb => registeredCb !== cb);
     };
 
     /***
      * Remove all request event handler.
      * 
      * */
     removeAll():void {
      this.cbList.forEach(cb => {
         this.page.off("request", cb);
      });
      this.cbList = [];
     }
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
