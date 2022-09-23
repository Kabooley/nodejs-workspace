/********************************************************************
 * 
 * *******************************************************************/ 
import type puppeteer from 'puppeteer';
import { selectors } from '../constants/selectors';

// Only requiring title and id.
export interface iIllustMangaElement {
    id: string;
    title: string;
    illustType?: number;
    xRestrict?: number;
    restrict?: number;
    sl?: number;
    url?: string;
    description?: string;
    tags?: any[];
    userId?: string;
    userName?: string;
    width?: number;
    height?: number;
    pageCount?: number;
    isBookmarkable?: boolean;
    bookmarkData?: any;
    alt?: string;
    titleCaptionTranslation?: any[];
    createDate?: string;
    updateDate?: string;
    isUnlisted?: boolean;
    isMasked?: boolean;
    profileImageUrl?: string;
}



let escapedKeyword: string;
let numberOfResultPages: number;
let ids: string[] = [];
let currentPage: number = 0;


/***
 * Collect specified element and return collection as array.
 * 
 * @param
 * @param
 * */ 
export const collectElementsAsArray = <T>(data: T[], key: keyof T): T[keyof T][] => {
    const arr = data.map((e: T) => {
        if(e[key] !== undefined) return e[key];
        else return undefined;
    });
    return arr.filter((v): v is Exclude<typeof v, undefined> => v !== undefined);
}


/**
 * Collect artwork id from thumbnails in keyword search result page.
 * 
 * If the result 
 * 
 * */ 
export const collectIdsFromResultPages = async (page: puppeteer.Page, keyword: string, res: puppeteer.HTTPResponse): Promise<string[]> => {
    console.log(`Collecting artwork id. Page: ${currentPage + 1}`);
    try {
        // Just to be safe, wait a few sec.
        if(currentPage > 0) await page.waitForNetworkIdle();
        const { illustManga } = await res.json();
        // NOTE: Omit validation of JSON object.
        // Collect ids of thumbnails
        if(!illustManga || !illustManga.data || !illustManga.total) throw new Error('Unexpected JSON data has been received')
        ids = [...ids, ...collectElementsAsArray<iIllustMangaElement>(illustManga.data, 'id')];
    
        // Set only once.
        if(currentPage === 0) {
            numberOfResultPages = illustManga.total/illustManga.data.length;
            escapedKeyword = encodeURIComponent(keyword);
        }
    
        // Define wait functions
        const waitJson = page.waitForResponse(res =>
            res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
            && res.status() === 200
        );
        const loaded = page.waitForNavigation({ waitUntil: ["load", "domcontentloaded"] });

        // Transition and recursive call
        if(currentPage < numberOfResultPages){
            currentPage++;
            await page.click(selectors.nextPage);
            const r: puppeteer.HTTPResponse = await waitJson;
            await loaded;
            await collectIdsFromResultPages(page, keyword, r);
        }
        
        // DEBUG: 再帰呼び出しだから余計なことをしていないか...
        console.log("collectIdsFromResultPages() just before return");
        return ids;
    }
    catch(e) {
        await page.screenshot();
        throw e;
    }
};


export const collectIdsFromResultPagesVer2 = async (page: puppeteer.Page, keyword: string, res: puppeteer.HTTPResponse): Promise<string[]> => {
    console.log(`Collecting artwork id. Page: ${currentPage + 1}`);
    try {
        // Just to be safe, wait a few sec.
        if(currentPage > 0) await page.waitForNetworkIdle();
        const { illustManga } = await res.json();
        // NOTE: Omit validation of JSON object.
        // Collect ids of thumbnails
        if(!illustManga || !illustManga.data || !illustManga.total) throw new Error('Unexpected JSON data has been received')
        ids = [...ids, ...collectElementsAsArray<iIllustMangaElement>(illustManga.data, 'id')];

    
        // Set only once.
        if(currentPage === 0) {
            numberOfResultPages = illustManga.total/illustManga.data.length;
            escapedKeyword = encodeURIComponent(keyword);
        }
    
        // Define wait functions
        const waitJson = page.waitForResponse(res =>
            res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
            && res.status() === 200
        );
        const loaded = page.waitForNavigation({ waitUntil: ["load", "domcontentloaded"] });

        // Transition and recursive call
        if(currentPage < numberOfResultPages){
            currentPage++;
            await page.click(selectors.nextPage);
            const r: puppeteer.HTTPResponse = await waitJson;
            await loaded;
            await collectIdsFromResultPages(page, keyword, r);
        }
        
        // DEBUG: 再帰呼び出しだから余計なことをしていないか...
        console.log("collectIdsFromResultPages() just before return");
        return ids;
    }
    catch(e) {
        await page.screenshot();
        throw e;
    }
};

// TODO: USAGE of ./TaskQueue.ts

import { TaskQueue } from './TaskQueue';

const collectingQueue = new TaskQueue();
function collectIds() {};
function collectTitles() {};
function collectAuthors() {};
function completeCollect() {
    return Promise.resolve();
}

collectingQueue.push(collectIds);
collectingQueue.push(collectTitles);
collectingQueue.push(collectAuthors);
collectingQueue.execute(completeCollect);


// interface iRequiredSearchResultData {
//     error:boolean;
//     body: {
//         illustManga: {
//             data: iIllustMangaElement[];
//             total: number;
//             bookmarkRanges?: any[];
//         },
//         popular?: {
//             recent?: any[];
//             permanent?: any[];
//         };
//         relatedTags?: string[];
//         tagTransition?: any;
//         zoneConfig?: any;
//         extraData?: any;
//     };
// };
// 
// ver.1
// 
// export const collectIdsFromResultPages = async (page: puppeteer.Page, keyword: string, res: puppeteer.HTTPResponse): Promise<string[]> => {
//     console.log(`Collecting artwork id. Page: ${currentPage + 1}`);
//     try {
//         // Just to be safe, wait a few sec.
//         await page.waitForNetworkIdle();
//         const json: iRequiredSearchResultData = await res.json();
//         // NOTE: Omit validation of JSON object.
//         // Collect ids of thumbnails
//         if(!json.body.illustManga.data || !json.body.illustManga.total) throw new Error('')
//         ids = [...ids, ...collectElementsAsArray<iIllustMangaElement>(json.body.illustManga.data, 'id')];

    
//         // Define wait functions
//         const waitJson = page.waitForResponse(res =>
//             res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${keyword}?word=${keyword}`)
//             && res.status() === 200
//         );
//         const loaded = page.waitForNavigation({ waitUntil: ["load", "domcontentloaded"] });

//         // Set only once.
//         if(currentPage === 0) numberOfResultPages = json.body.illustManga.total/json.body.illustManga.data.length;
    
//         // Transition and recursive call
//         if(currentPage < numberOfResultPages){
//             currentPage++;
//             await page.click(selectors.nextPage);
//             const r: puppeteer.HTTPResponse = await waitJson;
//             await loaded;
//             await collectIdsFromResultPages(page, keyword, r);
//         }
        
//         // DEBUG: 再帰呼び出しだから余計なことをしていないか...
//         console.log("collectIdsFromResultPages() just before return");
//         return ids;
//     }
//     catch(e) {
//         await page.screenshot();
//         throw e;
//     }
// };