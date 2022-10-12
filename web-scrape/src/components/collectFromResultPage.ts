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
import { retrieveDeepProp } from '../utilities/objectModifier';


/***
 * @param   {puppeteer.Page} page - puppeteerNode page instance.
 * @param   {iBodyIncludesIllustManga} res - HTTPResponse body object that express this interface.
 * @param   {string} key - One of the key of this interface
 * @return  {Promise<string[]>}
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
            // let result: iIllustManga | undefined = retrieveDeepProp<iIllustManga>(["body", "illustManga"], res);
            // let result: iIllustManga = retrieveDeepProp<iIllustManga>(["body", "illustManga"], res);
            let {data, total} = retrieveDeepProp<iIllustManga>(["body", "illustManga"], res);

            const collector = new Collect<iIllustMangaDataElement>();
            const navigation = new Navigation();
            navigation.resetWaitForOptions({ waitUntil: ["load", "networkidle2"]});
            navigation.resetFilter(httpResponseFilter);

            let currentPage: number = 1;
            let lastPage: number = 0;
            let collected: string[] = [];
            lastPage = Math.floor(total / data.length);
    
            // DEBUG: 
            console.log("Begin to collect...");

            while(currentPage <= lastPage) {
                // DEBUG:
                console.log(`Page: ${currentPage} / ${lastPage}`);

                if(!data || !total) throw new Error("Cannot capture illustManga data.");
                // resetDataに渡す前に広告要素フィルタリング！！
                let d: iIllustMangaDataElement[] = data.filter((e: iIllustMangaDataElement | {}) => {
                    return !e.hasOwnProperty('isAdContainer')
                });
                collector.resetData(d);
                collected = [...collected, ...collector.execute(key)];
                const r: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(page, page.click(selectors.nextPage));
                let result: iIllustManga = retrieveDeepProp<iIllustManga>(["body", "illustManga"], r.shift());
                data = result.data;
                currentPage++;

                // DEBUG:
                console.log(`Current amount of collected data by ${key}: ${collected.length}`);
            };
            return collected;
        }
        catch(e) {
            await page.screenshot({type: "png", path: "./dist/errorCollectFromResultPage.png"});
            throw e;
        }
};