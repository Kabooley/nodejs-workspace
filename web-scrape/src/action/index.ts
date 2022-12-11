/****************************************************
 * Action class
 * 
 * CLIで指定された動作を実行するための関数を返すためのクラス
 * sequences[circulator] = sequences[circulator]
 * .then(() => navigation())
 * .then((res) => resolveResponsesToSpecificData(res))
 * .then((data) => doAction(data))  <-- here.
 * .then(() => /.../)
 * 
 * 逐次処理に含めることを前提とするので
 * Promiseを返すこと
 * 逐次処理の段階で前回のPromiseから引数をとらないこと
 * 
 * 
 * 取得する可能性のあるC
 * - `collect byKeyword --keyword --tags --bookmarkOver --userName`
 * とくになし
 * - `collect fromBookmark --keyword --tags --bookmarkOver --userName`
 * とくになし
 * - `bookmark --keyword --tags --bookmarkOver --userName`
 * そのartworkをブックマークする操作
 * - `download byKeyword --keyword --tags --bookmarkOver --userName`
 * - `download fromBookmark --keyword --tags --bookmarkOver --userName`
 * ダウンロードする
 * 
 * 実行する内容は
 * *************************************************/ 
import * as fs from 'fs';
import type http from 'http';
import type { Http2SecureServer } from 'http2';
import type puppeteer from 'puppeteer';
import { Downloader } from '../http/downloader';

// TODO: Define this
interface iOptions {

    // iCollectOPtions
    // iBookmarkOptions
}
export class Action {
    constructor(private options: iOptions, private page: puppeteer.Page){};


    download(
        url: string, 
        dest: fs.PathLike, 
        options: BufferEncoding | StreamOptions | undefined,
        requestOptions: http.RequestOptions) {
        const opt = options !== undefined ? options : {};
        const wfs: fs.WriteStream = fs.createWriteStream(dest, opt);
        return new Downloader(requestOptions, wfs).download();
    }

    /***
     * DOM操作をする
     * どこでブックマークするかでセレクタが異なるはず
     * 
     * 検索結果ページで実行するのか
     * artworkページで実行するのか
     * */ 
    bookmark() {
        return this.page.click("")
    }

    errorHandler() {

    }
};