/*************************************************************************
 * Fill search form with keyword and press Enter.
 * 
 * GET `https://www.pixiv.net/ajax/search/artworks/${keyword}?word=${keyword}&order=date_d&mode=all&p=1&s_mode=s_tag&type=all&lang=ja
 * ***********************************************************************/ 
import type puppeteer from 'puppeteer';
import { selectors } from '../constants/selectors';


export const search = async (page: puppeteer.Page, keyword: string): Promise<puppeteer.HTTPResponse> => {
    try {
        await page.type(selectors.searchBox, keyword, { delay: 100 });
        // waitJson requires specified HTTPResponse 
        const waitJson = page.waitForResponse(res =>
            res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${keyword}?word=${keyword}`)
            && res.status() === 200
        );
        const loaded = page.waitForNavigation({ waitUntil: ["load", "domcontentloaded"] });
        page.keyboard.press('Enter');
        const json: puppeteer.HTTPResponse = await waitJson;
        // NOTE: `loaded` MAY OCCURES ERROR. If many error occures, then delete it.
        await loaded;

        console.log('Moved to search result page');
        return json;
    }
    catch(e) {
        // DEBUG: take screenshot to know what happened
        await page.screenshot({type: "png", path: "./dist/errorSearching.png"});
        throw e;
    }
}