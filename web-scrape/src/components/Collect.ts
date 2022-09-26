/********************************************************************
 * 
 * *******************************************************************/ 

// Only requiring title and id.
export interface iIllustMangaDataElement {
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
};

export interface iIllustManga {
    data: iIllustMangaDataElement[],
    total: number
};

export interface iBodyIncludesIllustManga {
    error: boolean;
    body: iIllustManga;
};


export class Collect<T> {
    private data: T[];
    constructor() {
        this.data = [];
    };

    /***
     * Collect value by specifying key name from object and return array of collection.
     * 
     * @param {T[]} data - Object from which the value is to be retrieved.
     * @param {keyof T} key - Key of object that passed as first argument and to be retrieved.
     * @return {T[keyof t][]} - Array 
     * 
     * USAGE:
     * 
     * Example below collecting `id` and `title` value from `illustManga.data` object and make them array.
     * 
     * ```TypeScript
     * let ids: string[] = [];
     * let titles: string[] = [];
     * ids = [...ids, ...collectElementsAsArray<iIllustMangaElement>(illustManga.data, 'id')];
     * titles = [...titles, ...collectElementsAsArray<iIllustMangaElement>(illustManga.data, 'title')];
     * ```
     * */ 
    _collector(key: keyof T): T[keyof T][] {
        const arr = this.data.map((e: T) => {
            if(e[key] !== undefined) return e[key];
            else return undefined;
        });
        return arr.filter((v): v is Exclude<typeof v, undefined> => v !== undefined);
    };

    execute(key: keyof T): T[keyof T][] {
        return this._collector(key);
    };

    /**
     * Reset data.
     * Remove reference of previous data.
     * */ 
    resetData(data: T[]): void {
        this.data = [];
        this.data = [...data];
    }
}

// --- LEGACY ---
// 
// /***
//  * Collect value by specifying key name from object and return array of collection.
//  * 
//  * @param {T[]} data - Object from which the value is to be retrieved.
//  * @param {keyof T} key - Key of object that passed as first argument and to be retrieved.
//  * @return {T[keyof t][]} - Array 
//  * 
//  * USAGE:
//  * 
//  * Example below collecting `id` and `title` value from `illustManga.data` object and make them array.
//  * 
//  * ```TypeScript
//  * let ids: string[] = [];
//  * let titles: string[] = [];
//  * ids = [...ids, ...collectElementsAsArray<iIllustMangaElement>(illustManga.data, 'id')];
//  * titles = [...titles, ...collectElementsAsArray<iIllustMangaElement>(illustManga.data, 'title')];
//  * ```
//  * */ 
// export const collectElementsAsArray = <T>(data: T[], key: keyof T): T[keyof T][] => {
//     const arr = data.map((e: T) => {
//         if(e[key] !== undefined) return e[key];
//         else return undefined;
//     });
//     return arr.filter((v): v is Exclude<typeof v, undefined> => v !== undefined);
// };
// 
// import type puppeteer from 'puppeteer';
// import { selectors } from '../constants/selectors';
// 
// /**
//  * Collect artwork id from thumbnails in keyword search result page.
//  * 
//  * If the result 
//  * 
//  * */ 
// export const collectIdsFromResultPages = async (page: puppeteer.Page, keyword: string, res: puppeteer.HTTPResponse): Promise<string[]> => {
//     console.log(`Collecting artwork id. Page: ${currentPage + 1}`);
//     try {
//         // Just to be safe, wait a few sec.
//         if(currentPage > 0) await page.waitForNetworkIdle();
//         const { illustManga } = await res.json();
//         // NOTE: Omit validation of JSON object.
//         // Collect ids of thumbnails
//         if(!illustManga || !illustManga.data || !illustManga.total) throw new Error('Unexpected JSON data has been received')
//         ids = [...ids, ...collectElementsAsArray<iIllustMangaElement>(illustManga.data, 'id')];
    
//         // Set only once.
//         if(currentPage === 0) {
//             numberOfResultPages = illustManga.total/illustManga.data.length;
//             escapedKeyword = encodeURIComponent(keyword);
//         }
    
//         // Define wait functions
//         const waitJson = page.waitForResponse(res =>
//             res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
//             && res.status() === 200
//         );
//         const loaded = page.waitForNavigation({ waitUntil: ["load", "domcontentloaded"] });

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


// export const collectIdsFromResultPagesVer2 = async (page: puppeteer.Page, keyword: string, res: puppeteer.HTTPResponse): Promise<string[]> => {
//     console.log(`Collecting artwork id. Page: ${currentPage + 1}`);
//     try {
//         // Just to be safe, wait a few sec.
//         if(currentPage > 0) await page.waitForNetworkIdle();
//         const { illustManga } = await res.json();
//         // NOTE: Omit validation of JSON object.
//         // Collect ids of thumbnails
//         if(!illustManga || !illustManga.data || !illustManga.total) throw new Error('Unexpected JSON data has been received')
//         ids = [...ids, ...collectElementsAsArray<iIllustMangaElement>(illustManga.data, 'id')];

    
//         // Set only once.
//         if(currentPage === 0) {
//             numberOfResultPages = illustManga.total/illustManga.data.length;
//             escapedKeyword = encodeURIComponent(keyword);
//         }
    
//         // Define wait functions
//         const waitJson = page.waitForResponse(res =>
//             res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
//             && res.status() === 200
//         );
//         const loaded = page.waitForNavigation({ waitUntil: ["load", "domcontentloaded"] });

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