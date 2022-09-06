/***********************************
 * Fill search form and enter.
 * 
 * ********************************/ 
import type puppeteer from 'puppeteer';
import { selectors } from '../constants/selectors';

export const search = async (page: puppeteer.Page, keyword: string): Promise<void> => {
    try {
        await page.type(selectors.searchBox, keyword, { delay: 100 });
        await Promise.all([
            page.waitForNavigation({ waitUntil: ["load", "networkidle2"] }),
            page.keyboard.press("Enter"),
        ]);
        console.log(`Searching ${keyword}...`);
    }
    catch(e) {
        throw e;
    }
}