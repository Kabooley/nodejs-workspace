/****************************************************************
 * Artoworkページから任意の情報を取得する機能。
 * 
 * ひとまずで、この関数はartworkページid配列を取得して、idから各artworkページへアクセスして収集結果を返すまでを実行する。
 * 
 * 
 * */

import type puppeteer from "puppeteer";
import { Navigation } from './Navigation';
import { selectors } from '../constants/selectors';

interface iRequirement {
    /* NOTE: key of iArtworkData にすべきか、決め打ちしちゃうか... */ 
};

interface iCollectionFromArtwork {};

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
}


/****
 * 
 * @param { puppeteer.Page } page - puppeteer page instance
 * @param { string[] } ids - Array consist of id that express artwork page id.
 * @param {string[]} requirement - Array consist of key of `iBodyOfArtworkPageResponse` to be collected.
 * 
 * @return {iArtworkData[]} - 
 * */ 

 const artworkUrl: string = `https://www.pixiv.net/artworks/`;

//  Only returns callback function only for page.waitForResponse()
 const getCallback = function(requiredUrl: string): ((res: puppeteer.HTTPResponse) => boolean) {
    const cb = (res: puppeteer.HTTPResponse): boolean => {
        return res.status() === 200 && res.url().includes(requiredUrl);
    };
    return cb;
 };

/***
 * Navigation.navigateBy()で返されるHTTPResponseなどからなる配列から、
 * page.waitForResponse()から返された戻り値だけを抜き出して返す。
 * 
 * NOTE: 引数であるresがNavigation.navigateBy()の戻り値で、
 * 且つそれの最初の要素がwaitForResponse()の戻り値であることを大前提にしている。
 * 
 * TODO: 次の実装
 * res : (puppeteer.HTTPResponse | any)[] からres[0]を抜き出して、
 * res[0]がiBodyOfArtworkPageResponse型であることのチェックして合格したら
 * res[0].bodyがiArtworkDataであることのチェック
 * これらに合格したらres[0].bodyを返す
 * 
 * res[0].object.hasOwnProperty(keyof iBodyOfArtworkPageResponse)は可能？
 * res[0].bodyが存在するのかのチェックの方がいいかな
 * それだとハードコーディングなんだけど、
 * それをいうとこの関数をすごく汎用的にしないといけないなぁ
 * 
 * ならば機能を分割した方がいいねぇ
 * */  
 const removeFromResponse = async <T>(res: (puppeteer.HTTPResponse | any)[]): Promise<T> => {
    if(!res[0]) throw new Error("Something went wrong but required HTTP Response could not captured.");
    return res[0];
 };

 
 const isFulfillRequirement = (body: iArtworkData, requirement): boolean => {
     // とにかくrequirementを満たすかどうかチェックする
     // 満たすならtrue、そうじゃないならfalse
     return result;
 };

 const dummy: iBodyOfArtworkPageResponse = {
    error: false,
    message: "",
    body: {
        illustId: "12345",
        illustTitle: "title of this artwork",
        illustType: 0,
        sl:"",
        urls:{
            original:"",    // 実際はstringではなくて正規表現である。取得したい情報。
        },
        pageCount: 3	// 多分一枚目以外の画像枚数
    }
 };
 

/****
 * @param {} - 
 * @param {} - 
 * @param {iRequirement} [requirement] -  
 * @param {} - 
 * 
 * */  
 const collectArtworksData = async (
        page: puppeteer.Page, 
        passedIds: string[], 
        requirement?: iRequirement
    ): Promise<iArtworkData[]> => {
 
     // Set up navigation.
     const navigate = new Navigation(page);
 
     let res: (puppeteer.HTTPResponse | any)[] = [];
     let collected: iArtworkData[] = [];
     let promise: Promise<void> = Promise.resolve();
     let cb: (r: puppeteer.HTTPResponse) => boolean;

     for(const id of passedIds) {
         // -- ここの囲った部分は終わるまで ---------------------
         // 次のナビゲーション(ループ)に行くことは許されない
         
        //  毎ループ、responseフィルタリングのためにwaitForResponseのコールバックを更新しなくてはならない
         cb = getCallback(artworkUrl + id)
         navigate.resetWaitForResponseCallback(page.waitForResponse(cb));
        //  TODO: Navigateクラスの修正
         res = await navigate.navigateBy(page.goto(artworkUrl + id));
         // bodyとはHTTPResponse.body.bodyである
         const body: iArtworkData = await removeFromResponse<iArtworkData>(res);
         // --------------------------------
 
         // -- ここの条件分岐は非同期にして次のページ遷移に行っちゃっていい --
         // なのでプロミスで囲ってあとで終わればOKにすればいいかも。
         // 
         // !requirement.length --> bodyをそのまま納める
         // requirement.length --> 次を検査する
         // isFullfillRequirement() --> bodyを納める
         // !isFullfillRequirement() --> bodyは納めない
         promise = promise.then(() => {
             if(requirement.length) {
                 if(!isFulfillRequirement(body)) collected.push(body);
             }
             else {
                 collected.push(body);
             }
         });
         // ---------------------------------------------------
     };
 
     await promise;
     return collected;
 };
 
 
