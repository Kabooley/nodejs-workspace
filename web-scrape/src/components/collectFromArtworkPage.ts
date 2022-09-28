/****************************************************************
 * Artoworkページから任意の情報を取得する機能。
 * 
 * ひとまずで、この関数はartworkページid配列を取得して、idから各artworkページへアクセスして収集結果を返すまでを実行する。
 * 
 * 
 * */

import type puppeteer from "puppeteer";
import { Collect } from './Collect';
import { Navigation } from './Navigation';
import { selectors } from '../constants/selectors';

let artworkUrl: string = `https://www.pixiv.net/artworks/`;

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
        mini?:string;
        thumb?:string;
        small?:string;
        regular?:string;
        original:string;    // 取得したい情報
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
const collectFromArtworkPage = async (
    page: puppeteer.Page, 
    ids: (keyof iArtworkData)[],
    requirement: iArtworkData[]
    ): Promise<void> => {
    try {
        // page.goto(artworkUrl + id);
        // navigation
        // get http response (to check navigation is ok)
        // check response
        // collect information from response
        // next

        let navigation = new Navigation(page);
        let collector = new Collect();


        let currentPage: number = 1;
        let lastPage: number = 0;
    }
    catch(e) {
        throw e;
    }
}

