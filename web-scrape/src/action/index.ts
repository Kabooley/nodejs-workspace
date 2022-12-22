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
 * Actionはコマンドの内容を取得してなにをexecute()で実行するのか、
 * 自身で組み立てるようにする
 * 
 * TODO: 受け取りうるコマンドの型の定義
 * *************************************************/ 
import type puppeteer from 'puppeteer';
import * as fs from 'fs';
import type http from 'http';
import { Downloader } from '../http/downloader';

// NOTE: `StreamOptions` fs.d.tsに定義されてあるのだけれど、
// なぜかインポートできないので
// しかたなくここに転記する。
import type * as promises from 'fs/promises';
interface StreamOptions {
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

export class Action {
    constructor(
        // private command: iCommands
    ){
        this.download = this.download.bind(this);
        this.bookmark = this.bookmark.bind(this);
        // this.caller = this.caller.bind(this);
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

    // /**
    //  * NOTE: ボツ。JavaScriptでオーバーロードは使うべきではない。
    //  * オーバーロードは直接呼び出すときにのみ使うべきで、
    //  * 動的な引数によって呼び出されるときには使われるべきではない。
    //  * 
    //  * Determine the method to return from a predefined command.
    //  * 
    //  * NOTE: caller()は2パターン用意した
    //  * - オーバーロードシグネチャバージョン
    //  * - ユニオンタイプバージョン
    //  * 
    //  * それぞれが解決できることと解決できないこと
    //  * 
    //  * - オーバーロードの方だと、usage()は期待通り動作して問題ないが、`return _caller(this.command)`がエラーになる
    //  * - ユニオンタイプバージョンだと、usageの方でexecutorが判別してもらえなくて永遠にdownload()メソッドだとTypeScriptから言い張られる。
    //  * 
    //  * */ 
    // caller(): iActionBookmark & iActionDownload {
    //     const self = this;
    //     function _caller(command: "bookmark"): iActionBookmark;
    //     function _caller(command: "download"): iActionDownload;
    //     function _caller(command: "collect"): () => void;
    //     function _caller(command: iCommands)
    //     // : iActionDownload | iActionBookmark 
    //     {
    //         switch(command) {
    //             case "download": return self.download;
    //             case "bookmark": return self.bookmark;
    //             case "collect": return function(){};
    //             default: throw new Error("No such a action method");
    //         }
    //     };
    //     // switch(this.command) {
    //     //     case "bookmark": return _caller("bookmark");
    //     //     case "download": return _caller("download");
    //     //     default: throw new Error("No such a action method");
    //     // }

    //     // このように動的に呼び出される引数でオーバーロードを呼び出すと、
    //     // エラーになる。
    //     // 直接"bookmark"と呼び出すとエラーにはならない。
    //     return _caller(this.command);
    // };

    // では_caller()を関数でラップしないで使ってみたら？
    // やっぱり駄目でした。
    // caller(): iActionBookmark;
    // caller(): iActionDownload;
    // caller(): () => void;
    // caller(){
    //     switch(this.command) {
    //         case "download": return this.download;
    //         case "bookmark": return this.bookmark;
    //         case "collect": return function(){};
    //         default: throw new Error("No such a action method");
    //     }
    // };
};


import * as path from 'path';
import * as url from 'url';
import type { iIllustData } from '../components/collectArtworkPage/typeOfArtworkPage';
import { AssembleParallelPageSequences } from '../components/AssembleParallelPageSequences-2';
import { setUncaughtExceptionCaptureCallback } from 'process';

const callDownloader = (data: iIllustData): void => {
    const { urls, illustTitle } = data;
    if(urls === undefined || illustTitle === undefined || urls.original === undefined) throw new Error("");
    
    const _url: URL = new url.URL(urls.original);
    const filepath: fs.PathLike = path.join(__dirname, illustTitle, path.extname(urls.original));
    const httpRequestOption: http.RequestOptions = {
        method: "GET",
        host: _url.host,
        path: _url.pathname,
        protocol: "https"
    };
    const options: StreamOptions = {
        encoding: 'binary',
        autoClose: true,
        emitClose: true,
        highWaterMark: 1024
    };

    return new Action().download(filepath, httpRequestOption, options);
};


const closure = function() {
    return callDownloader;
};

const closure2 = function(page: puppeteer.Page, selector: string) {
    return function() {
        return new Action().bookmark(page, selector);
    }
};


// NOTE: 結局こいつをどうやって型つければいいのかって話
const assigningAction = (command: iCommands, page: puppeteer.Page, selector: string) => {
    switch(command) {
        case "bookmark": return closure2(page, selector);
        case "download": return closure();
        default: throw new Error("");
    };
};

// AssembleParallelPageSequences-2.ts
setAction() {

}

// src/components/collectArtworkPage/index-2.ts
const assembler = new AssembleParallelPageSequences<iIllustData>();
// before for loop.
assembler.setAction(assigningAction(optionsProxy.get().command, page, ""));

// src/components/collectArtworkPage/solutionProcess.ts
return this.executeAction(element);