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


type iOptions = "collect" | "bookmark" | "download";
type iMethodDownload = (dest: fs.PathLike, options: BufferEncoding | StreamOptions | undefined, requestOptions: http.RequestOptions) => void;

export class Action {
    constructor(private options: iOptions){
        this.download = this.download.bind(this);
        this.bookmark = this.bookmark.bind(this);
        this.execute = this.execute.bind(this);
    };

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
     * */ 
    bookmark(page: puppeteer.Page, selector: string): Promise<void> {
        return page.click(selector);
    };

    /***
     * executeというより、実行する関数を返す関数
     * なので引数が不要である
     * 
     * usage:
     *  `action.execute()(//呼出したメソッドに必要な引数)`
     * */ 
    execute() {
        // 今のところ、各コマンドは独立（コマンドが複数になることはない）なので
        // switch分で行うことを振り分ける
        switch(this.options) {
            case "bookmark": return this.bookmark;
            case "download": return this.download;
            default : return function(){};
        }
    };
};

async function usage(command: iOptions, page: puppeteer.Page) {
    const action = new Action(command);
    // TODO: expected 3 parameter, but got 2といわれる
    // 
    // ここを調べてみよう
    // https://stackoverflow.com/questions/58673034/type-inference-from-switch-case-return-with-typescript
    return action.execute()(page, "ssss");

}