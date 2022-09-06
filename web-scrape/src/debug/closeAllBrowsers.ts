/*****************************************************
 * headless browserが開いたままなのかもしれない時に
 * すべての開きっぱなしのbrowserを閉じる
 * 
 * 
 * */ 
import type puppeteer from 'puppeteer';

export const browserContextProcess = async function(browser: puppeteer.Browser) {
    try {
        const contexts: puppeteer.BrowserContext[] = await browser.browserContexts();
        console.log("contexts:");
        console.log(contexts);

        const process = await browser.process();
        console.log(process);
    }
    catch(e) {
        throw e;
    }
}