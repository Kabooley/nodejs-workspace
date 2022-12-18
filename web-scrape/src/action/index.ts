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
import * as fs from 'fs';
import type http from 'http';
import type puppeteer from 'puppeteer';
import { Downloader } from '../http/downloader';

// TODO: Define this
type iOptions = "collect" | "bookmark" | "download";

export class Action<T> {
    constructor(private options: iOptions, private page: puppeteer.Page){};

    /**
     * 引数は
     * 
     * */ 
    download(
        dest: fs.PathLike, 
        options: BufferEncoding | StreamOptions | undefined,
        requestOptions: http.RequestOptions) {
        const opt = options !== undefined ? options : {};
        const wfs: fs.WriteStream = fs.createWriteStream(dest, opt);
        return new Downloader(requestOptions, wfs).download();
    };

    /**
     * TODO: セレクターは動的に決まるので、引数から渡したい
     * */ 
    bookmark() {
        return this.page.click("")
    };

    // download()もbookmark()も動的な引数が必要なのだが、
    // このままだとその動的な引数を渡すことができない
    async execute(element: T, page: puppeteer.Page): Promise<any> {
        switch(this.options) {
            case "collect":return;
            case "bookmark": return this.bookmark(page);
            case "download": return this.download()
        }
    };
};