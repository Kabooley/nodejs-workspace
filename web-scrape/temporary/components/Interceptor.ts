/***************************************************
 * Intercepts HTTP Request of Page.
 * 
 * *************************************************/ 
 import type puppeteer from 'puppeteer';
import { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from 'puppeteer';

//  true as instance is already exists.
 let isInstantiated: boolean = false;
 let isDefaultSet: boolean = false;
//  
 const defaultHandler = (r: puppeteer.HTTPRequest): void => {
    if(r.isInterceptResolutionHandled())return;
    r.continue({}, DEFAULT_INTERCEPT_RESOLUTION_PRIORITY);
 }

 class RequestInterceptor {
    private cbList: ((event: puppeteer.HTTPRequest) => void)[];
    constructor(public page: puppeteer.Page){
        this.cbList = [];
        this.run = this.run.bind(this);
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.removeAll = this.removeAll.bind(this);
        this.addDefault = this.addDefault.bind(this);
        this.removeDefault = this.removeDefault.bind(this);
    };

    /***
     * Call setRequestInterception to set true.
     * And add request event handler to not stall requests.
     * 
     * To not stall requests, defaultHandler must be attatched.
     * */ 
    async run(): Promise<void> {
        await this.page.setRequestInterception(true);
        this.page.on("request",defaultHandler);
    };

    /***
     * Add request event handler.
     * 
     * NOTE: DO NOT PASS ANONYMOUS FUNCTION
     * 
     * cb must include
     * `if(event.isInterceptResolutionHandled())return;`
     * */ 
    add(cb: (event: puppeteer.HTTPRequest) => void): void {
        this.page.on("request", cb);
        this.cbList.push(cb);
    };

    /***
     * Remove request event handler.
     * 
     * */   
    remove(cb: (event: puppeteer.HTTPRequest) => void): void {
        this.page.off("request", cb);
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
    };

    addDefault(): void {
        if(!isDefaultSet) this.page.on("request", defaultHandler);
    }

    removeDefault(): void {
        if(isDefaultSet) this.page.off("request", defaultHandler);
    }
};



// Limited number of instance to only one.
 export const createRequestInterceptor = (page: puppeteer.Page): RequestInterceptor => {
    if(!isInstantiated) {
        isInstantiated = true;
        return new RequestInterceptor(page);
    }
    else throw new Error('RequestInterceptor is already exist.');
 };

//  Exports only class type.
 export type iRequestInterceptor = InstanceType<typeof RequestInterceptor>;