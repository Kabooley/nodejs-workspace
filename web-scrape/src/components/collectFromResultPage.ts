/***
 * Component 
 * 
 * Collect ids from search result pages
 * 
 * 
 * */ 
import type puppeteer from 'puppeteer';
import { Collect } from './Collect';
import type { iIllustMangaDataElement, iIllustManga, iBodyIncludesIllustManga } from './Collect';
import { Navigation } from './Navigation';
import { selectors } from '../constants/selectors';
import { getFirstElementToJson } from '../helper/lessCommons';
import { retrieveDeepProp ,takeOutPropertiesFrom } from '../utilities/objectModifier';

const getIllustManga = async (data: iBodyIncludesIllustManga): Promise<iIllustManga> => {
    const illustManga: iIllustManga = data?.body?.illustManga;
    if(!illustManga || !illustManga.data || !illustManga.total) throw new Error("Cannot capture illustManga data.");
    return illustManga;
};


/***
 * @param {puppeteer.Page} page - puppeteerNode page instance.
 * @param {iBodyIncludesIllustManga} res - HTTPResponse body object that express this interface.
 * @param {string} key - One of the key of this interface
 * @return {Promise<string[]>}
 * 
 * */ 
export const collectFromSearchResult = async (
    page: puppeteer.Page, 
    res: iBodyIncludesIllustManga, 
    key: keyof iIllustMangaDataElement,
    httpResponseFilter: (res: puppeteer.HTTPResponse) => boolean
    ): Promise<string[]> => {
        try {
            // DEBUG:
            console.log(`Collect by ${key}...`);

            // Check if res is not includes required property.
            let result: iIllustManga = retrieveDeepProp<iIllustManga>(["body", "illustManga"], res);
            // TODO: const {data, total} = という形にした方がいいかも

            // // DEBUG:
            // console.log(result);

            const collector = new Collect<iIllustMangaDataElement>();
            const navigation = new Navigation();
            navigation.resetWaitForOptions({ waitUntil: ["load", "networkidle2"]});
            navigation.resetFilter(httpResponseFilter);

            let currentPage: number = 1;
            let lastPage: number = 0;
            let data: string[] = [];
            lastPage = Math.floor(result.total / result.data.length);
    
            // DEBUG: 
            console.log("Begin to collect...");

            while(currentPage <= lastPage) {
                // DEBUG:
                console.log(`Page: ${currentPage} / ${lastPage}`);

                if(!result || !result.data || !result.total) throw new Error("Cannot capture illustManga data.");
                // resetDataに渡す前に広告要素フィルタリング！！
                let d: iIllustMangaDataElement[] = result.data.filter((e: iIllustMangaDataElement | {}) => {
                    return !e.hasOwnProperty('isAdContainer')
                });
                collector.resetData(d);
                data = [...data, ...collector.execute(key)];
                const r: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(page, page.click(selectors.nextPage));
                // if(!r[0] || !(await r[0].json())) throw new Error("Unexpected value has been returned after navigation");
                // result = (await r[0].json()).illustManga;
                result = await getIllustManga(await getFirstElementToJson<iBodyIncludesIllustManga>(r));
                currentPage++;

                // DEBUG:
                console.log(`Current collected data by ${key}: ${data.length}`);
            };
            return data;
        }
        catch(e) {
            await page.screenshot({type: "png", path: "./dist/errorCollectFromResultPage.png"});
            throw e;
        }
};