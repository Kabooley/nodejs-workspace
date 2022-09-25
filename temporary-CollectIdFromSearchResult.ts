/***
 * Component 
 * 
 * Collect ids from search result pages
 * 
 * */ 
import type puppeteer from 'puppeteer';
import type { iIllustMangaElement } from './components/Collect';
import { Navigation } from './components/Navigation';
import { Collect } from './components/Collect';
import { selectors } from './constants/selectors';

const cb = (res: puppeteer.HTTPResponse): boolean => {
    return res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
&& res.status() === 200}

export const collectIdsFromSearchResult = async (
    page: puppeteer.HTTPResponse, res: puppeteer.HTTPResponse
    ): Promise<string[]> => {
        try {
            let response: iIllustMangaElement = await res.json().illustManga;
            if(!response || !response.data || !response.total) throw new Error("Cannot capture illustManga data.");

            let navigation = new Navigation(page);
            let collector = new Collect<iIllustMangaElement>();
            navigation.resetWaitForNavigation(page.waitForNavigation({ waitUntil: ["load", "networkidle02"]}));
            navigation.resetWaitForResponseCallback(page.resetWaitForResponseCallback(cb));

            let currentPage: number = 1;    // 0にしておかないとwhile()が機能しない
            let lastPage: number = 0;       // 1にしておかないとwhile()が機能しない
            let data: string[] = [];        // stringを前提にしているよ
            lastPage = res.total / res.data.length;
    
            while(currentPage <= lastPage) {
                if(!response || !response.data || !response.total) throw new Error("Cannot capture illustManga data.");
                collector.resetData(response.data);
                data = [...data, ...collector.execute('id')];
                const [r] = await navigation.navigateBy(function(){page.click(selectors.nextPage)});
                if(!r[0] || !(await r[0].json())) throw new Error("Unexpected value has been returned after navigation");
                response = await r.json().illustManga;
                currentPage++;
            };

            return data;
        }
        catch(e) {
            throw e;
        }
};



/***
 * 
 * 
 * */
 
