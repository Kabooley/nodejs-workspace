import type puppeteer from 'puppeteer';
import type { iIllustMangaDataElement, iBodyIncludesIllustManga } from '../constants/illustManga';
import type { iCollectOptions } from '../commandParser/commandModules/collectCommand';
import { Navigation } from './Navigation';
import { Collect } from './Collect';
import { AssembleParallelPageSequences } from './AssembleParallelPageSequences';
import { retrieveDeepProp } from '../utilities/objectModifier';
import mustache from '../utilities/mustache';

// Property that assembler will collect.
const key: keyof iIllustMangaDataElement = "id";
// URL of each search result page. 
const url: string = "https://www.pixiv.net/tags/{{keyword}}/artworks?p={{i}}&s_mode=s_tag";
// URL that used in page.waitForResponse().
const filterUrl: string = "https://www.pixiv.net/ajax/search/artworks/{{keyword}}?word={{keyword}}&order=date_d&mode=all&p={{i}}&s_mode=s_tag&type=all&lang=ja";


type iResponsesResolveCallback<T> = (params: any) => T[] | Promise<T[]>;

/***
 * 
 * 
 * */ 
 const resolver: iResponsesResolveCallback<iIllustMangaDataElement> = async (responses: (puppeteer.HTTPResponse | any)[]) => {
    const response = await responses.shift().json() as iBodyIncludesIllustManga;
    const resolved: iIllustMangaDataElement[] = retrieveDeepProp<iIllustMangaDataElement[]>(["body", "illustManga", "data"], response);
    if(resolved === undefined) throw new Error("");
    return resolved;
};


/***
 * Generate AssembleParallelPageSequences<iIllustMangaDataElement> instance.
 * ptions
 *  
 * 
 * TODO: Set type of return value.
 * */ 
export const assemblingResultPageCollectProcess = async (
    browser: puppeteer.Browser, 
    numberOfProcess: number, 
    numberOfPages: number,
    options: iCollectOptions
    // ): Promise<AssembleParallelPageSequences<iIllustMangaDataElement>> => {
    ) => {

                
    // DEBUG:
    console.log("assemblingCollectProcess()");


    // NOTE: Code outside of try block is for catch block to scope instance.
    const assembler = new AssembleParallelPageSequences<iIllustMangaDataElement>(
        browser, numberOfProcess, 
        new Navigation(), 
        new Collect<iIllustMangaDataElement>()
    );
    try {
        await assembler.initialize();
        assembler.setResponsesResolver(resolver);

        // DEBUG:
        console.log("generating assembler parallel process...");
        
        for(let currentPage = 1; currentPage <= numberOfPages; currentPage++) {
            const circulator: number = currentPage % numberOfProcess;
            if(assembler.getSequences()[circulator] !== undefined
                && assembler.getPageInstance(circulator) !== undefined
            ) {
                const page = assembler.getPageInstance(circulator)!;
                assembler.setResponseFilter(
                    (res: puppeteer.HTTPResponse) => 
                        res.status() === 200 
                        && res.url() === mustache(filterUrl, {keyword: encodeURIComponent(options.keyword), i: currentPage})
                );

                assembler.getSequences()[circulator] = assembler.getSequences()[circulator]!
                // DEBUG: Logs current sequence number and current keyword search result page.
                .then(() => console.log(`Running Instance and Sequence: ${circulator} currentPage: ${currentPage}`))
                // 1. Navigation
                .then(() => {
                    // DEBUG:
                    console.log(`[assemblingResultPageCollectProcess] S:${circulator} - P:${currentPage} Navigating to ${mustache(url, {keyword: encodeURIComponent(options.keyword), i:currentPage})}...`);

                    return assembler.navigation.navigateBy(page, page.goto(mustache(url, {keyword: encodeURIComponent(options.keyword), i:currentPage}), { waitUntil: ["load", "domcontentloaded"]}))
                })
                // 2. Resolves http response to specific data(iIllustMangaDataElement[])
                .then((responses: (puppeteer.HTTPResponse | any)[]) => {
                    // DEBUG:
                    console.log(`[assemblingResultPageCollectProcess] S:${circulator} - P:${currentPage} Resolving HTTP Response...`);
                    return assembler.resolveResponses!(responses);
                })
                // 3. Collect id from the data.
                .then((data: iIllustMangaDataElement[]) => {
                    // DEBUG:
                    console.log(`[assemblingResultPageCollectProcess] S:${circulator} - P:${currentPage} Collecting property...`);

                    return assembler.collectProperties(data, key)
                })
                // 4. Error handling
                .catch((e) => assembler.errorHandler(e, circulator))
            }
        };
        
        // DEBUG:
        console.log("generating has been done.");

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