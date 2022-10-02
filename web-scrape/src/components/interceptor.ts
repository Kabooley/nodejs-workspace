/***************************************************
 * Intercepts HTTP Request.
 * 
 * TODO: 一度abortしたら再度傍受するためにはsetRequestInterception(true)が必要なのか確認
 * TODO: 確認次第GET 指定URLのリクエスト取得できるたびにabortする機能を実装
 * *************************************************/ 
import type puppeteer from 'puppeteer';

export const setRequestInterceptor = async (page: puppeteer.Page): Promise<void> => {
    await page.setRequestInterception(true);
    page.on('request', (interceptedRequest: puppeteer.HTTPRequest) => {
        if (interceptedRequest.isInterceptResolutionHandled()) return;
        console.log("--- INTERCEPTED -----------");
        console.log(interceptedRequest.method());
        console.log(interceptedRequest.url());
        console.log("----------------------------");
        interceptedRequest.continue();
    });
};