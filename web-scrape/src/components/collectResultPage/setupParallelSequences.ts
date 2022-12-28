/********************************************************
 * NOTE: Replaced from `assemblingResultPageCollectPrcess.ts`
 * 
 * *****************************************************/ 
import type puppeteer from 'puppeteer';
import type { iIllustMangaDataElement } from '../../constants/illustManga';
import type { iOptions } from '../../commandParser/commandTypes';
import { Navigation } from '../Navigation';
import { AssembleParallelPageSequences } from '../AssembleParallelPageSequences-2';
import mustache from '../../utilities/mustache';
// process definition
import { resolveProcess } from './resolveProcess';
import { solutionProcess } from './solutionProcess';
import { errorHandlingProcess } from './errorHandlingProcess';

// URL of each search result page. 
const url: string = "https://www.pixiv.net/tags/{{keyword}}/artworks?p={{i}}&s_mode=s_tag";
// URL that used in page.waitForResponse().
const filterUrl: string = "https://www.pixiv.net/ajax/search/artworks/{{keyword}}?word={{keyword}}&order=date_d&mode=all&p={{i}}&s_mode=s_tag&type=all&lang=ja";

/***
 * Contains `keyword` and necessary properties in this module from options.
 * Unnecessary properties in options are excluded.
 * */ 
const optionsProxy = (function() {
    let options = {} as iOptions;
    return {
        set: function(v: iOptions) {
            options = {
                ...options, ...v
            };
        },
        get: function(): iOptions {
            return options;
        }
    };
})();


/***
 * numberOfPagesだけHTTPResponseを取得して、その結果を配列に収める
 * numberOfProcessだけ並列処理させる。
 * 
 * 1 Se quence:
 *  - navigateBy page.goto(result-page-url)
 *  - resolve http reeponse
 *  - solve resolved data(contains the data to array)
 *  - errorn handling
 * 
 * 
 * */ 
export const setupParallelSequences = async (
    browser: puppeteer.Browser, 
    numberOfProcess: number, 
    numberOfPages: number,
    options: iOptions
    ) => {

                
    // DEBUG:
    console.log("Start: assemblingCollectProcess()");

    optionsProxy.set({...options});

    // NOTE: Code outside of try block is for catch block to scope instance.
    const assembler = new AssembleParallelPageSequences<iIllustMangaDataElement>(
        browser, numberOfProcess, 
        new Navigation()
    );

    try {
        await assembler.initialize();
        assembler.setResolvingProcess(resolveProcess);
        assembler.setSolutionProcess(solutionProcess);
        assembler.setErrorHandlingProcess(errorHandlingProcess);

        // DEBUG:
        console.log("generating assembler parallel process...");
        
        for(let currentPage = 1; currentPage <= numberOfPages; currentPage++) {
            const circulator: number = currentPage % numberOfProcess;
            const _url: string = mustache(filterUrl, {kwyword: encodeURIComponent(optionsProxy.get().keyword), i: currentPage});
            
            assembler.setResponseFilter(
                function httpResponseFilter(res: puppeteer.HTTPResponse) {
                    return res.status() === 200 && res.url() === _url;
                }
            );

            assembler.setNavigationTrigger(
                function trigger(page: puppeteer.Page) {
                    return page.goto(url, { waitUntil: [ "load", "networkidle2"] });
            });
            
            assembler.setupSequence(circulator);
        };
        
        // DEBUG:
        console.log("Done. Assembling collect result page process");

        return assembler.run()
            .then(() => assembler.getCollectedProperties())
            .catch(e => assembler.errorHandler(e))
            .finally(() => assembler.finally());
    }
    catch(e) {
        assembler.finally();
        throw e;
    }
};