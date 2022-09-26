/*************************************************************************
 * Fill search form with keyword and press Enter.
 * 
 * waitResponse waits for response of request that express... 
 * GET `https://www.pixiv.net/ajax/search/artworks/${keyword}?word=${keyword}&order=date_d&mode=all&p=1&s_mode=s_tag&type=all&lang=ja
 * 
 * ***********************************************************************/ 
import type puppeteer from 'puppeteer';
import type { iBodyIncludesIllustManga } from './Collect';
import { Navigation } from './Navigation';
import { getFirstElementToJson } from '../helper/lessCommons';
import { selectors } from '../constants/selectors';

export const search = async (page: puppeteer.Page, keyword: string): Promise<iBodyIncludesIllustManga> => {
    try {
        const escapedKeyword: string = encodeURIComponent(keyword);
        const navigation = new Navigation(page);
        navigation.resetWaitForResponseCallback(page.waitForResponse((res) => {return res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
        && res.status() === 200}));

        await page.type(selectors.searchBox, keyword, { delay: 100 });
        const res: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(function() { return page.keyboard.press('Enter')});

        // NOTE: スコープアウトする前にresponseをjson()してから返すこと
        return await getFirstElementToJson<iBodyIncludesIllustManga>(res);
    }
    catch(e) {
        // DEBUG: take screenshot to know what happened
        await page.screenshot({type: "png", path: "./dist/errorSearching.png"});
        throw e;
    }
}