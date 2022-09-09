/***********************************
 * Fill search form and enter.
 * 
 * ********************************/ 
import type puppeteer from 'puppeteer';
import { selectors } from '../constants/selectors';

export const search = async (page: puppeteer.Page, keyword: string): Promise<void> => {
    try {
        await page.type(selectors.searchBox, keyword, { delay: 100 });
        page.on('response', async (response: puppeteer.HTTPResponse): Promise<void> => {
            console.log("-- response ---");
            console.log(response.url());
            console.log(response.status());
            console.log(response.headers());
            // console.log(await response.text());
            // console.log(await response.json());
            console.log("---------------");
        });
        page.keyboard.press("Enter");

        setTimeout(() => {

        }, 20000);
    }
    catch(e) {
        throw e;
    }
}

// export const search = async (page: puppeteer.Page, keyword: string): Promise<void> => {
//     try {
//         await page.type(selectors.searchBox, keyword, { delay: 100 });
//         page.on('response', async (response: puppeteer.HTTPResponse): Promise<void> => {
//             console.log("-- response ---");
//             console.log(response.url());
//             console.log(response.status());
//             console.log(response.headers());
//             // console.log(await response.text());
//             // console.log(await response.json());
//             console.log("---------------");
//         });
//         const [res] = await Promise.all([
//             page.waitForNavigation({ waitUntil: ["load", "networkidle2"] }),
//             page.keyboard.press("Enter")
//         ]);
//         if(!res || res.url() !== `https://www.pixiv.net/tags/${keyword}/artworks?s_mode=s_tag` && res.status() !== 200 || !res.ok())
//         throw new Error('Something went wrong among searching');
//         console.log('Result page');
//     }
//     catch(e) {
//         throw e;
//     }
// }

