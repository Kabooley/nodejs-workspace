/****************************************************************
 * Artoworkページから任意の情報を取得する機能。
 * 
 * ArtworkページURLの末尾のid一覧からなる配列を取得し、
 * 
 * 配列の各idを追加したURLへアクセスしてArtworkページの情報を、
 * 
 * HTTPResponseから取得する。
 * **************************************************************/

import type puppeteer from "puppeteer";
import { Navigation } from './Navigation';
import { takeOutPropertiesFrom } from '../utilities/objectModifier';


interface iBodyOfArtworkPageResponse {
    error: boolean;
    message:string;
    body: iArtworkData;
};

interface iArtworkData {
    illustId: string;
    illustTitle: string;
    illustComment?: string;
    id?: string;	// コメントした人
    title?: string;
    description?: string;
    illustType: number;		// 普通のイラストならたぶん０、gifとかだと0じゃない
    createDate?:string;
    uploadDate?:string;
    restrict?:number;
    xRestrict?:number;
    sl:string;
    urls:{
        mini?:string;       // 実際はstringではなくて正規表現である
        thumb?:string;      // 実際はstringではなくて正規表現である
        small?:string;      // 実際はstringではなくて正規表現である
        regular?:string;    // 実際はstringではなくて正規表現である
        original:string;    // 実際はstringではなくて正規表現である。取得したい情報。
    },
    tags?: any;
    pageCount: number;		// 多分一枚目以外の画像枚数
};

 const artworkUrl: string = `https://www.pixiv.net/artworks/`;

//  Only returns callback function only for page.waitForResponse()
 const getCallback = function(requiredUrl: string): ((res: puppeteer.HTTPResponse) => boolean) {
    const cb = (res: puppeteer.HTTPResponse): boolean => {
        return res.status() === 200 && res.url().includes(requiredUrl);
    };
    return cb;
 };


/***
 * 前提：配列`res`の第一引数は、page.waitForResponseからの戻り値のHTTPResponseである
 * 
 * 
 * */ 
export const collectArtworksData = async (
        page: puppeteer.Page, 
        ids: string[], 
        requirement?: (keyof iArtworkData)[]
    ): Promise<iArtworkData[]> => {

     const navigate = new Navigation(page);
     let collected: iArtworkData[] = [];
     let promise: Promise<void> = Promise.resolve();

     for(const id of ids) {
         // NOTE: res[0].json()が取得できるまで次のループへ行くことは許されない
         
        //  毎ループ、responseフィルタリングのためにwaitForResponseのコールバックを更新しなくてはならない
         navigate.resetWaitForResponseCallback(page.waitForResponse(getCallback(artworkUrl + id)));
        //  TODO: Navigateクラスの修正
        let res: (puppeteer.HTTPResponse | any)[] = await navigate.navigateBy(function(){ return page.goto(artworkUrl + id)});

        //「res[0]はpuppeteer.HTTPResponseである && res[0].json().bodyが存在する」が真なら
        // responseBodyにレスポンスのボディを代入する。
        if(typeof res[0]["json"] !== "function" || !res[0].hasOwnProperty("json")){
            throw new Error("Something went wrong but required properties did not exist.");
        }
        // .json()でレスポンスのbodyを取得する
        // それはiBodyOfArtworkPageResponse型であるとする
        let responseBody: iBodyOfArtworkPageResponse = await res[0].json();

        promise = promise.then(() => {
            // "body"というプロパティが存在するか確認する
            if(!responseBody.hasOwnProperty('body')){
                throw new Error("Something went wrong but required properties did not exist.");
            };

            // iArtworkDataの指定のプロパティからなるオブジェクトをcollectedへ格納する
            const body: iArtworkData = takeOutPropertiesFrom<iArtworkData>(
                responseBody.body, 
                requirement ? requirement : ["illustId", "illustTitle", "sl", "urls", "pageCount"]
            );
            collected.push(body);
        });
     };
 
     await promise;
     return collected;
 };
 
 
