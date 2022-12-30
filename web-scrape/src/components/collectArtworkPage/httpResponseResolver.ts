// /*******************************************************************
//  * Implementations of resolving HTTP Response. 
//  * *****************************************************************/ 
// import type puppeteer from 'puppeteer';
// import type { iResponsesResolveCallback } from '../AssembleParallelPageSequences';
// import type { iMetaPreloadData, iIllustData } from './typeOfArtworkPage';
// import * as jsdom from 'jsdom';


// const { JSDOM } = jsdom;

// /***
//  * HTTPResponse resolver.
//  * 
//  * @param {string} id - ID of artwork that puppeteer now accessing. 
//  * @return {[iIllustData]} - `iResponsesResolveCallback`型の都合上配列として返すことになっている(修正されるかも)
//  * 
//  * responses
//  *  > iMetaPreloaddata
//  *      > iIllust
//  *          > iIllustData
//  * 
//  * */ 
// export const resolver: iResponsesResolveCallback<iIllustData> = async (
//     responses: (puppeteer.HTTPResponse | any)[], id: number
//     ) => {
//     // Pop out first element of responses.
//     const response: puppeteer.HTTPResponse = responses.shift();
//     // Check if the response is valid.
//     if(
//         !response.headers().hasOwnProperty("content-type")
//         || !response.headers()["content-type"]!.includes('text/html')
//     ) throw new Error("Error: Cannot retrieve HTTP Response body.");

//     // Resolving HTTPResponse body data as iMetaPreloadData | undefined
//     const { document } = new JSDOM(await response.text()).window;
//     const json = document.querySelector('#meta-preload-data')!.getAttribute("content");
//     const metaPreloadData: iMetaPreloadData | undefined = json ? JSON.parse(json): undefined;

//     if(metaPreloadData !== undefined && metaPreloadData.illust[id] !== undefined) 
//         return [metaPreloadData.illust[id] as iIllustData];
//     else 
//         throw new Error("Error: Cannot retrieve 'illust' property from metadata");
// };

