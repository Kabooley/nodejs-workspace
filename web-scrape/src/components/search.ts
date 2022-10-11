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
import { selectors } from '../constants/selectors';
// import { getFirstElementToJson } from '../helper/lessCommons';

export const search = async (page: puppeteer.Page, keyword: string): Promise<iBodyIncludesIllustManga> => {
    try {
        const escapedKeyword: string = encodeURIComponent(keyword);
        const navigation = new Navigation();
        navigation.resetFilter((res) => {return res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
        && res.status() === 200});

        // DEBUG:
        console.log(`Searcing: ${keyword}...`);
        
        await page.type(selectors.searchBox, keyword, { delay: 100 });
        let res: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(page, page.keyboard.press('Enter'));

        const response: puppeteer.HTTPResponse = res.shift();
        if(response === undefined || !response.hasOwnProperty('json')) {
            throw new Error('search(): Something went wrong but search() could not get expected HTTP Response.');
        }
        return await response.json();
    }
    catch(e) {
        // DEBUG: take screenshot to know what happened
        await page.screenshot({type: "png", path: "./dist/errorSearching.png"});
        throw e;
    }
}