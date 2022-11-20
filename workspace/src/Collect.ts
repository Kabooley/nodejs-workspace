/********************************************************************
 * Collects value by specified key from array consist of data typed T
 * 
 * 与えられたT型オブジェクトからなる配列から、
 * 指定のT型のプロパティに一致する値を取り出して配列で返す。
 * 
 * *******************************************************************/ 

/***
 * @type {T} - Type of the array element object.
 * 
 * */ 
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
        this.data.length = 0;
        this.data = [...data];
    };

    /***
     * NOTE: >>working in progress<<
     * 
     * フィルタリング機能を追加する
     * 
     * 指定のプロパティが含まれていたらそのプロパティを含むオブジェクトだけを取り出す
     * 
     * どの深度のプロパティを対象とするの？
     * 
     * */ 
    _filter(requiredKey: keyof T, filterLogic: Function) {
        const filtered = this.data.map((e: T) => {
            return filterLogic(requiredKey, e);
        });
        
        return filtered.filter((v): v is Exclude<typeof v, undefined> => v !== undefined);
    };
    /**
     * const filterIncludingTag = (requiredTag: string[]) => {
     *  
     * }
     * 
     * T: iIllustMangaDataElement = [				{
					"id": "101393474",
					"title": "彼岸の庭渡久１２０６",
					"illustType": 1,
					"xRestrict": 0,
					"restrict": 0,
					"sl": 2,
					"url": "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/22/00/05/55/101393474_p0_square1200.jpg",
					"description": "",
					"tags": [
						"東方",
						"彼岸の庭渡様",
						"庭渡久侘歌",
						"豪徳寺ミケ",
						"少名針妙丸",
						"射命丸文",
						"リリーホワイト",
						"リリーブラック"
					],
					"userId": "9824519",
					"userName": "人郷想幻（げんそうきょうじん）",
					"width": 287,
					"height": 821,
					"pageCount": 1,
					"isBookmarkable": true,
					"bookmarkData": null,
					"alt": "#東方 彼岸の庭渡久１２０６ - 人郷想幻（げんそうきょうじん）のマンガ",
					"titleCaptionTranslation": {
						"workTitle": null,
						"workCaption": null
					},
					"createDate": "2022-09-22T00:05:55+09:00",
					"updateDate": "2022-09-22T00:05:55+09:00",
					"isUnlisted": false,
					"isMasked": false,
					"profileImageUrl": "https://i.pximg.net/user-profile/img/2022/06/17/10/08/33/22889909_0d5609f386476846aa404ad4c634e38f_50.jpg"
				},
]
     * 
     * 
     * 
     * */ 
};

// --- USAGE ---
// 
// interface iData {
//     id: number;
//     name: string;
// };

// const data: iData[] = [
//     {id: 1, name: "Maria", ...},
//     {id: 2, name: "Mario", ...},
//     {id: 3, name: "Mary", ...},
//     {id: 4, name: "Matilda", ...},
//     {id: 5, name: "Manda", ...},
// ];
// const collector = new Collect<iData>;
// collector.resetData(data);
// const ids = collector.execute("id");
// console.log(ids); // 1, 2, 3, 4, ...


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