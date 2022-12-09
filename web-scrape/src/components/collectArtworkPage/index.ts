/*********************************************************
 * param:
 * - idTable: Array of Artwork page url id.
 * - numberOfProcess: How many page instances are required.
 * - requirements: Required things which the artwork to have.
 * 
 * If the Page instance is only one:
 * - for(const id of idTable){ / sequential process detail / }
 * - sequential process detail : 
 *      - navigate to the specific url
 *      - get http response and solve it
 *      - retrieve data from solved data
 *      - find retrieved data for that including required data
 *      - If it does, then collect required data, or go next.
 * 
 * Or multiple page instances are required
 * 
 * 要は生成したPromiseの数だけ逐次処理が生み出される
 * その逐次処理はsequential process detailを指し
 * sequential process detailでは代わりにpage[circulator]が処理を担う
 * 
 * - Create promise chain and page instances as numberOfProcess requires.
 * - promises
 * - for(const id of idTable) { / Decorated sequential process detail / }
 *      const circulator = counter % numberOfProcess;
 *      promises[circulator] = promises[circulator]
 *      .then(() => sequential process detail )
 * *******************************************************/ 
import type puppeteer from 'puppeteer';
import type { iCollectOptions } from '../../commandParser/commandModules/collectCommand';
import type { iIllustData } from './typeOfArtworkPage';
import { Navigation } from '../Navigation';
import { Collect } from '../Collect';
import { AssembleParallelPageSequences } from '../AssembleParallelPageSequences';
import { generateFilterLogic } from './filterLogic';
import { httpResponseFilter } from './httpResponseFilter';
import { resolver } from './httpResponseResolver';
import { filterOnlyMatchedKey } from '../../utilities/Filter';
import mustache from '../../utilities/mustache';

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



/***
 * 
 * 
 * */ 
export const assemblingCollectProcess = async (
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
        // Assemblerの初期化
        await assembler.initialize();
        // 逐次処理中のHTTPResponseの解決を実行する関数のセット
        assembler.setResponsesResolver(resolver);

        // Generate sequential process as same as number of idTable.

        let counter: number = 0;
        for(const id of idTable) {
            const circulator = counter % numberOfProcess;
            const url = mustache(artworkPageUrl, {id: id});
            const page: puppeteer.Page = assembler.getPageInstance(circulator)!;

            if(page !== undefined && assembler.getSequences()[circulator] !== undefined) {
                assembler.getSequences()[circulator]
                = assembler.getSequences()[circulator]!
                // 1. Navigate to the url
                .then(() => {
                    assembler.setResponseFilter(httpResponseFilter(id, artworkPageUrl));
                    return assembler.navigation.navigateBy(
                        page, page.goto(url, {waitUntil: ["load", "networkidle2"]}));
                })
                // 2. Resolve HTTP Response which from HTTPResponse filter
                .then((responses: (puppeteer.HTTPResponse | any)[]) => assembler.resolveResponses!(responses, id))
                // 3. Collect data only matched to requirement
                .then((resolved: iIllustData[]) => 
                    assembler.collect(
                        assembler.filter(resolved, generateFilterLogic(optionsProxy.get()))
                    )
                )
                // 4. In case commad was `bookmark`
                .then(() => {
                    // TODO: DOM 操作というかアクション的処理はここで実行する
                    // たとえばそのartworkをブックマークするなど
                    // TODO: assembler.setAction()みたいなメソッドの追加
                })
                .catch(e => assembler.errorHandler(e))
            }
            else {
                console.error("Error: Page instance or sequence promise does not exist. Or the index accesses out range of array");
            }
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