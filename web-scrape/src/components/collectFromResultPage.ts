/***
 * Component 
 * 
 * Collect ids from search result pages
 * 
 * TODO: 本当はresult.dataには広告要素が混じる。これをフィルタリングで排除すること。
 * 
 * */ 
import type puppeteer from 'puppeteer';
import { Collect } from './Collect';
import type { iIllustMangaDataElement, iIllustManga  } from './Collect';
import { Navigation } from './Navigation';
import { selectors } from '../constants/selectors';

/***
 * @param {}
 * 
 * 
 * */ 
export const collectFromSearchResult = async (
    page: puppeteer.Page, 
    res: puppeteer.HTTPResponse, 
    key: keyof iIllustMangaDataElement,
    httpResponseFilter: (res: puppeteer.HTTPResponse) => boolean
    ): Promise<string[]> => {
        try {
            let result: iIllustManga = (await res.json()).illustManga;
            
            // DEBUG:
            // どうやらこの時点でundefinedな模様...
            console.log(result);

            if(!result || !result.data || !result.total) throw new Error("Cannot capture illustManga data.");

            const navigation = new Navigation(page);
            const collector = new Collect<iIllustMangaDataElement>();
            navigation.resetWaitForNavigation(page.waitForNavigation({ waitUntil: ["load", "networkidle2"]}));
            navigation.resetWaitForResponseCallback(page.waitForResponse(httpResponseFilter));

            let currentPage: number = 1;
            let lastPage: number = 0;
            let data: string[] = [];
            lastPage = result.total / result.data.length;
    
            while(currentPage <= lastPage) {
                if(!result || !result.data || !result.total) throw new Error("Cannot capture illustManga data.");
                // 
                // TODO: resetDataに渡す前に広告要素フィルタリング！！
                // 
                // ---------------------------------------------------------
                let d: iIllustMangaDataElement[] = result.data.filter((e: iIllustMangaDataElement | {}) => {
                    return !e.hasOwnProperty('isAdContainer')
                })
                // ---------------------------------------------------------
                collector.resetData(d);
                data = [...data, ...collector.execute(key)];
                const r = await navigation.navigateBy(function(){ return page.click(selectors.nextPage)});
                if(!r[0] || !(await r[0].json())) throw new Error("Unexpected value has been returned after navigation");
                result = (await r[0].json()).illustManga;
                currentPage++;
            };
            return data;
        }
        catch(e) {
            throw e;
        }
};