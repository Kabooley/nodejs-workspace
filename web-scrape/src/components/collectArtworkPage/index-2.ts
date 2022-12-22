/*********************************************************
 * param:
 * *******************************************************/ 
import type puppeteer from 'puppeteer';
import type { iCollectOptions } from '../../commandParser/commandModules/collectCommand';
import type { iIllustData } from './typeOfArtworkPage';
import { Navigation } from '../Navigation';
import { Collect } from '../Collect';
import { AssembleParallelPageSequences } from '../AssembleParallelPageSequences-2';
import { filterOnlyMatchedKey } from '../../utilities/Filter';
import { httpResponseFilter } from './httpResponseFilter';
// process definition
import { resolveProcess } from './resolveProcess';
import { solutionProcess } from './solutionProcess';
import mustache from '../../utilities/mustache';
// import { navigationProcess } from './navigationProcess';

import type * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import type * as http from 'http';

// NOTE: temporary
import { Action } from '../../action';
import type { iCommands, iActionDownload, iActionBookmark } from '../../action';
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
type iActionClosure<T> = (data: T) => Promise<any> | any;

// GLOBAL
const artworkPageUrl: string = "https://www.pixiv.net/artworks/{{id}}";
const validOptions: (keyof iCollectOptions)[] = ["keyword", "bookmarkOver"];

/***
 * Contains `keyword` and necessary properties in this module from options.
 * Unnecessary properties in options are excluded.
 * */ 
 const optionsProxy = (function() {
    let options = {} as iCollectOptions;
    return {
        set: function(v: iCollectOptions) {
            options = {
                ...options, ...v
            };
        },
        get: function(): iCollectOptions {
            return options;
        }
    };
})();

/**
 * NOTE: あとでファイル分割するとして
 * */ 
const generateDownloadOptions = (data: iIllustData) => {
    const { urls, illustTitle } = data;
    if(urls === undefined || illustTitle === undefined || urls.original === undefined) 
        throw new Error("Error: No expected data was contained in data.");
    
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

    return {dest: filepath, httpRequestOption: httpRequestOption, options: options};
};

/***
 * NOTE: iIllustData型変数以外のiActionClosureが求める引数は、ここですべて引数として取得しなくてはならない。
 * 
 * */ 
const assignAction = (command: iCommands, page: puppeteer.Page, selector: string): iActionClosure<iIllustData> => {
    switch(command) {
        case "bookmark": return bookmarker(page, selector);
        case "download": return downloader();
        default: throw new Error("No such a action command");
    }
};

const downloader = (): iActionClosure<iIllustData> => {
    return function(data: iIllustData): void {
        const { dest, httpRequestOption, options } = generateDownloadOptions(data);
        return new Action().download(dest, httpRequestOption, options);
    }
};

const bookmarker = (page: puppeteer.Page, selector: string): iActionClosure<iIllustData> => {
    return function(data: iIllustData): Promise<void> {
        return new Action().bookmark(page, selector);
    }
};


/***
 * 
 * 
 * */ 
export const setupCollectingArtworkPage = async (
    browser: puppeteer.Browser,
    numberOfProcess: number,
    idTable: string[],
    options: iCollectOptions
) => {
    optionsProxy.set({
        ...filterOnlyMatchedKey<iCollectOptions>(options, validOptions), 
        ...({keyword: options.keyword})
    });
    const assembler = new AssembleParallelPageSequences<iIllustData>(
        browser, numberOfProcess, 
        new Navigation(), new Collect<iIllustData>()
    );

    try {
        await assembler.initialize();
        
        // assembler.setNavigationProcess(navigationProcess);
        assembler.setResolvingProcess(resolveProcess);
        assembler.setSolutionProcess(solutionProcess);
        assembler.setErrorHandlingProcess();

        let counter: number = 1;
        for(const id of idTable) {
            // 毎ループで更新すべき単一の逐次処理の内容をここで定義する
            // 毎ループ更新した内容を反映させるならこのブロック内でsetメソッドを呼び出して更新済のprocess関数をセットする
            // 
            // 毎ループで更新すべき内容は...
            // page.goto()するときのURL
            // page.waitForResponse()のフィルターURL
            // 
            // 
            const circulator: number = counter % numberOfProcess;
            // このURLをnavigationProcessへ渡す手段がない...
            const url: string = mustache(artworkPageUrl, {id: id});
            // page.waitForResponseのURLの更新
            assembler.setResponseFilter(httpResponseFilter(id, url));
            // navigation内容の更新(URL)
            assembler.setNavigationTrigger(
                function trigger(page: puppeteer.Page) { 
                    return page.goto(url, { waitUntil: ["load", "networkidle2"] });
                });

            /**
             * NOTE: actionのセット
             * */ 
            assembler.setAction(
                assignAction(
                    // commandは現状取得できない。ひとまず
                    "collect",
                    assembler.getPageInstance(circulator)!,
                    "TODO: find out selector and store it here."
                )
            );

            assembler.setupSequence(circulator);
            counter++;
        }
        return assembler.run()
            .then(() => assembler.getCollected())
            .catch(e => assembler.errorHandler(e))
            .finally(() => assembler.finally());
    }
    catch(e) {
        assembler.finally();
        throw e;
    }
};
// export const setupCollectingArtworkPage = async (
//     browser: puppeteer.Browser,
//     numberOfProcess: number,
//     idTable: string[],
//     options: iCollectOptions
// ) => {
//     optionsProxy.set({
//         ...filterOnlyMatchedKey<iCollectOptions>(options, validOptions), 
//         ...({keyword: options.keyword})
//     });
//     const assembler = new AssembleParallelPageSequences<iIllustData>(
//         browser, numberOfProcess, 
//         new Navigation(), new Collect<iIllustData>()
//     );

//     try {
//         await assembler.initialize();
        
//         // assembler.setNavigationProcess(navigationProcess);
//         assembler.setResolvingProcess(resolveProcess);
//         assembler.setSolutionProcess(solutionProcess);
//         assembler.setErrorHandlingProcess();

//         let counter: number = 1;
//         for(const id of idTable) {
//             // 毎ループで更新すべき単一の逐次処理の内容をここで定義する
//             // 毎ループ更新した内容を反映させるならこのブロック内でsetメソッドを呼び出して更新済のprocess関数をセットする
//             // 
//             // 毎ループで更新すべき内容は...
//             // page.goto()するときのURL
//             // page.waitForResponse()のフィルターURL
//             // 
//             // 
//             const circulator: number = counter % numberOfProcess;
//             // このURLをnavigationProcessへ渡す手段がない...
//             const url: string = mustache(artworkPageUrl, {id: id});
//             // page.waitForResponseのURLの更新
//             assembler.setResponseFilter(httpResponseFilter(id, url));
//             // navigation内容の更新(URL)
//             assembler.setNavigationTrigger(
//                 function trigger(page: puppeteer.Page) { 
//                     return page.goto(url, { waitUntil: ["load", "networkidle2"] });
//                 });
//             assembler.setupSequence(circulator);
//             counter++;
//         }
//         return assembler.run()
//             .then(() => assembler.getCollected())
//             .catch(e => assembler.errorHandler(e))
//             .finally(() => assembler.finally());
//     }
//     catch(e) {
//         assembler.finally();
//         throw e;
//     }
// };