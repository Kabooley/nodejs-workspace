/****************************************************
 * Action class
 * 
 * 
 * *************************************************/ 
import type puppeteer from 'puppeteer';
import * as fs from 'fs';
import type http from 'http';
import { Downloader } from '../http/downloader';

// NOTE: `StreamOptions` fs.d.tsに定義されてあるのだけれど、
// なぜかインポートできないので
// しかたなくここに転記する。
import type * as promises from 'fs/promises';
export interface StreamOptions {
    flags?: string | undefined;
    encoding?: BufferEncoding | undefined;
    fd?: number | promises.FileHandle | undefined;
    mode?: number | undefined;
    autoClose?: boolean | undefined;
    /**
     * @default false
     */
    emitClose?: boolean | undefined;
    start?: number | undefined;
    highWaterMark?: number | undefined;
};


export type iCommands = "collect" | "bookmark" | "download";
export type iActionDownload = (dest: fs.PathLike, requestOptions: http.RequestOptions, options: BufferEncoding | StreamOptions | undefined) => void;
export type iActionBookmark = (page: puppeteer.Page, selector: string) => Promise<void>;
export type iActionClosure<T> = (data: T) => Promise<any> | any;

export default class Action {
    constructor(){
        this.download = this.download.bind(this);
        this.bookmark = this.bookmark.bind(this);
    };

    /**
     * 
     * NOTE: 呼出時に必要な引数について
     *  - dest: 予め用意できない。artworkページで取得したデータに基づいてファイル名を決定するので、データがあることが前提となる
     *  - requestOptions: あらかじめ用意できない。URL情報が上記と同様にあらかじめ必要である
     *  - options: 上記と同様。
     * */ 
    download(
        dest: fs.PathLike, 
        requestOptions: http.RequestOptions,
        options: BufferEncoding | StreamOptions | undefined,
        ) {
        const opt = options !== undefined ? options : {};
        const wfs: fs.WriteStream = fs.createWriteStream(dest, opt);
        return new Downloader(requestOptions, wfs).download();
    };

    /**
     * Clicks bookmark button on artwork page.
     * 
     * NOTE: 呼出時に必要な引数について
     * - page: 予め渡しておくことはできる
     * - selector: 予め渡しておくことはできる
     * */ 
    bookmark(page: puppeteer.Page, selector: string): Promise<void> {
        return page.click(selector);
    };
};

// --- LEGACY ---
// 
// export class Action {
//     constructor(
//         // private command: iCommands
//     ){
//         this.download = this.download.bind(this);
//         this.bookmark = this.bookmark.bind(this);
//         // this.caller = this.caller.bind(this);
//     };

//     /**
//      * 
//      * NOTE: 呼出時に必要な引数について
//      *  - dest: 予め用意できない。artworkページで取得したデータに基づいてファイル名を決定するので、データがあることが前提となる
//      *  - requestOptions: あらかじめ用意できない。URL情報が上記と同様にあらかじめ必要である
//      *  - options: 上記と同様。
//      * */ 
//     download(
//         dest: fs.PathLike, 
//         requestOptions: http.RequestOptions,
//         options: BufferEncoding | StreamOptions | undefined,
//         ) {
//         const opt = options !== undefined ? options : {};
//         const wfs: fs.WriteStream = fs.createWriteStream(dest, opt);
//         return new Downloader(requestOptions, wfs).download();
//     };

//     /**
//      * Clicks bookmark button on artwork page.
//      * 
//      * NOTE: 呼出時に必要な引数について
//      * - page: 予め渡しておくことはできる
//      * - selector: 予め渡しておくことはできる
//      * */ 
//     bookmark(page: puppeteer.Page, selector: string): Promise<void> {
//         return page.click(selector);
//     };

//     // /**
//     //  * NOTE: ボツ。JavaScriptでオーバーロードは使うべきではない。
//     //  * オーバーロードは直接呼び出すときにのみ使うべきで、
//     //  * 動的な引数によって呼び出されるときには使われるべきではない。
//     //  * 
//     //  * Determine the method to return from a predefined command.
//     //  * 
//     //  * NOTE: caller()は2パターン用意した
//     //  * - オーバーロードシグネチャバージョン
//     //  * - ユニオンタイプバージョン
//     //  * 
//     //  * それぞれが解決できることと解決できないこと
//     //  * 
//     //  * - オーバーロードの方だと、usage()は期待通り動作して問題ないが、`return _caller(this.command)`がエラーになる
//     //  * - ユニオンタイプバージョンだと、usageの方でexecutorが判別してもらえなくて永遠にdownload()メソッドだとTypeScriptから言い張られる。
//     //  * 
//     //  * */ 
//     // caller(): iActionBookmark & iActionDownload {
//     //     const self = this;
//     //     function _caller(command: "bookmark"): iActionBookmark;
//     //     function _caller(command: "download"): iActionDownload;
//     //     function _caller(command: "collect"): () => void;
//     //     function _caller(command: iCommands)
//     //     // : iActionDownload | iActionBookmark 
//     //     {
//     //         switch(command) {
//     //             case "download": return self.download;
//     //             case "bookmark": return self.bookmark;
//     //             case "collect": return function(){};
//     //             default: throw new Error("No such a action method");
//     //         }
//     //     };
//     //     // switch(this.command) {
//     //     //     case "bookmark": return _caller("bookmark");
//     //     //     case "download": return _caller("download");
//     //     //     default: throw new Error("No such a action method");
//     //     // }

//     //     // このように動的に呼び出される引数でオーバーロードを呼び出すと、
//     //     // エラーになる。
//     //     // 直接"bookmark"と呼び出すとエラーにはならない。
//     //     return _caller(this.command);
//     // };

//     // では_caller()を関数でラップしないで使ってみたら？
//     // やっぱり駄目でした。
//     // caller(): iActionBookmark;
//     // caller(): iActionDownload;
//     // caller(): () => void;
//     // caller(){
//     //     switch(this.command) {
//     //         case "download": return this.download;
//     //         case "bookmark": return this.bookmark;
//     //         case "collect": return function(){};
//     //         default: throw new Error("No such a action method");
//     //     }
//     // };
// };