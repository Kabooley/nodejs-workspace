/****************************************************************
 * Artoworkページから任意の情報を取得する機能。
 * 
 * ArtworkページURLの末尾のid一覧からなる配列を取得し、
 * 
 * 配列の各idを追加したURLへアクセスしてArtworkページの情報を、
 * 
 * HTTPResponseから取得する。
 * 
 * TODO: もしかしたらnavigate.navigationBy()からの戻り値が期待通りじゃないかもしれない。
 * **************************************************************/

import type puppeteer from "puppeteer";
import * as jsdom from 'jsdom';
import { Navigation } from './Navigation';
import { takeOutPropertiesFrom } from '../utilities/objectModifier';


interface iMetaPreloadData {
    timestamp: string;
    illust: iIllust;
};

interface iIllust {
    [key: string]: iIllustData;
};

interface iIllustData {
    illustId:string;
    illustTitle: string;
    illustComment: string;
    id: string;
    title: string;
    description: string;
    illustType: number;
    createDate: string;
    uploadDate: string;
    sl: number;
    urls: {
        mini: string;
        thumb: string;
        small: string;
        regular: string;
        original: string;
    },
    tags: {};
    pageCount: number;
    bookmarkCount: number;
    likeCount:number;
}



const { JSDOM } = jsdom;
const artworkUrl: string = `https://www.pixiv.net/artworks/`;
const defaulRequirement: (keyof iIllustData)[] = [
    "illustId", "illustTitle", "id", "title", "illustType", "urls", "pageCount", "bookmarkCount"
];


/***
 * 前提：配列`res`の第一引数は、page.waitForResponseからの戻り値のHTTPResponseである
 * 
 * 
 * */ 
export const collectArtworksData = async (
        page: puppeteer.Page, 
        ids: string[], 
        requirement?: (keyof iIllustData)[]
    ): Promise<iIllustData[]> => {
        try {
            const navigate = new Navigation(page);
            let collected: iIllustData[] = [];
            let promise: Promise<void> = Promise.resolve();
       
            for(const id of ids) {
                // DEBUG:
                console.log(`Collecting data from ${artworkUrl}${id}`);

                // NOTE: response.text()取得できるまで次のループへ行かない
               let resolved: (puppeteer.HTTPResponse | any)[] = await navigate.navigateBy(function(){ return page.goto(artworkUrl + id)});
                
                const response: puppeteer.HTTPResponse = resolved.pop();
                let metaPreloadData: iMetaPreloadData | undefined;

                if(response.headers().hasOwnProperty("content-type") && response.headers()["content-type"]!.includes('text/html')){
                    const { document } = new JSDOM(await response.text()).window;
                    const json = document.querySelector('#meta-preload-data')!.getAttribute("content");
                    metaPreloadData = json ? JSON.parse(json): undefined;
                };

                // text()取得出来たら後回しでいい
                promise = promise.then(() => {
                    console.log("promise pushed");
                    // So much undefined guard...
                    if(
                        metaPreloadData !== undefined 
                        && metaPreloadData!.hasOwnProperty("illust")
                        && metaPreloadData.illust[id] !== undefined
                    ) {
                        const i: iIllustData = metaPreloadData.illust[id] as iIllustData;
                        collected.push(takeOutPropertiesFrom<iIllustData>(i, requirement === undefined ? defaulRequirement : requirement));
                    };
                });
            };
            await promise;
            return collected;
        }
        catch(e) {
            await page.screenshot({type: "png", path: "./dist/errorCollectFromArtworkPage.png"});
            throw e;
        }
 };