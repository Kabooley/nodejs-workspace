/*************************************************************************
 * Fill search form with keyword and press Enter.
 * 
 * waitResponse waits for response of request that express... 
 * GET `https://www.pixiv.net/ajax/search/artworks/${keyword}?word=${keyword}&order=date_d&mode=all&p=1&s_mode=s_tag&type=all&lang=ja
 * 
 * ***********************************************************************/ 
import type puppeteer from 'puppeteer';
import { selectors } from '../constants/selectors';

// const encodeWhiteSpaces = (str: string): string => {
//     // 文字列を空白ごと切り分ける
//     return str.split(/[ ,]+/).join('%20');
// }

// こちらのsearch.tsはタイムアウト・エラーを起こすし、waitForResponse()は多分肝心なレスポンスを逃している。
// 
export const search = async (page: puppeteer.Page, keyword: string): Promise<puppeteer.HTTPResponse> => {
    try {
        await page.type(selectors.searchBox, keyword, { delay: 100 });
        // waitJson requires specified HTTPResponse 
        // const waitResponse = page.waitForResponse(res =>
        //     res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${keyword}?word=${keyword}`)
        //     && res.status() === 200
        // );

        // const encoded: string = encodeWhiteSpaces(keyword);
        const escapedKeyword: string = encodeURIComponent(keyword);
        
        // NOTE: Name it for ErrorStack.
        const waitForResponseCallback = (res: puppeteer.HTTPResponse): boolean => {
            console.log(res.url());
            return res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
            && res.status() === 200
        };

        const waitResponse = page.waitForResponse(waitForResponseCallback);
        // Wait for navigation is completed.
        const loaded = page.waitForNavigation({ waitUntil: ["load", "domcontentloaded"] });
        // Send keyword and triggers navigation.
        // 
        await page.keyboard.press('Enter');
        // Get response of above request.
        const res: puppeteer.HTTPResponse = await waitResponse;
        // NOTE: `loaded` MAY OCCURES ERROR low probability.
        await loaded;

        return res;
    }
    catch(e) {
        // DEBUG: take screenshot to know what happened
        await page.screenshot({type: "png", path: "./dist/errorSearching.png"});
        throw e;
    }
}