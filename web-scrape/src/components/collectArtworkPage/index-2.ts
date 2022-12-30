/*********************************************************
 * param:
 * *******************************************************/ 
import type puppeteer from 'puppeteer';
import type { iIllustData } from './typeOfArtworkPage';
import type { iPartialOptions } from '../../commandParser/commandTypes';
import { Navigation } from '../Navigation';
import { AssembleParallelPageSequences } from '../AssembleParallelPageSequences-2';
import { filterOnlyMatchedKey } from '../../utilities/Filter';
import { httpResponseFilter } from './httpResponseFilter';
// process definition
import { resolveProcess } from './resolveProcess/resolveProcess';
import { GenerateSolutionProcess } from './solutionProcess/solutionProcess';
import { errorHandlingProcess } from './errorHandlingProcess';
import mustache from '../../utilities/mustache';
// Relate to Action process
import { assignAction } from './action/assignAction';
import { generateDownloadOptions } from './action/generateDownloadOptions';
import { filterLogic } from './filterLogic';
import type { iCommands } from '../../action/Action';


// GLOBAL
const artworkPageUrl: string = "https://www.pixiv.net/artworks/{{id}}";
const validOptions: (keyof iPartialOptions)[] = ["keyword", "bookmarkOver"];

/***
 * Contains `keyword` and necessary properties in this module from options.
 * Unnecessary properties in options are excluded.
 * */ 
 const optionsProxy = (function() {
    let options = {} as iPartialOptions;
    return {
        set: function(v: iPartialOptions) {
            options = {
                ...options, ...v
            };
        },
        get: function(): iPartialOptions {
            return options;
        }
    };
})();

/***
 * 
 * 
 * */ 
export const setupCollectingArtworkPage = async (
    browser: puppeteer.Browser,
    numberOfProcess: number,
    idTable: string[],
    command: iCommands,
    options: iPartialOptions
) => {
    if(options.keyword === undefined) throw new Error("Command option `keyword` is necessary but there is no such a value.");

    optionsProxy.set({
        ...filterOnlyMatchedKey<iPartialOptions>(options, validOptions), 
        ...({keyword: options.keyword})
    });
    const assembler = new AssembleParallelPageSequences<iIllustData>(
        browser, numberOfProcess, new Navigation()
    );

    try {
        await assembler.initialize();

        // TODO: ここが冗長なので関数としてまとめたい...
        const generatorSolutionProcess = new GenerateSolutionProcess<iIllustData>();
        generatorSolutionProcess.setOptions(optionsProxy.get());
        generatorSolutionProcess.setFilterLogic(filterLogic);
        // ---
        
        assembler.setResolvingProcess(resolveProcess);
        assembler.setSolutionProcess(generatorSolutionProcess.generateSolutionProcess());
        assembler.setErrorHandlingProcess(errorHandlingProcess);

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
                assignAction<iIllustData>(command, assembler.getPageInstance(circulator)!,
                    "TODO: set selector",
                    generateDownloadOptions
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
//     options: iPartialOptions
// ) => {
//     optionsProxy.set({
//         ...filterOnlyMatchedKey<iPartialOptions>(options, validOptions), 
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