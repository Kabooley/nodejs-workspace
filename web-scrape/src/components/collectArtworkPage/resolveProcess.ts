import type puppeteer from 'puppeteer';
import type { iMetaPreloadData, iIllustData } from './typeOfArtworkPage';
import type { iAssemblerResolveProcess } from '../AssembleParallelPageSequences-2';
import type { AssembleParallelPageSequences } from '../AssembleParallelPageSequences-2';
import * as jsdom from 'jsdom';


const { JSDOM } = jsdom;
/***
 * 
 * AssembleParallelPageSequences.setupSequnece()で呼び出されることになる、
 * navigationProcess()の戻り値から特定の値を取り出す処理をする関数。
 * 呼び出され方はthen((responses) => resolveProcess(index, responses))となる。
 * 
 * - responsesから初めの要素(puppeteer.HTTPResponse)を取り出す
 * - HTTPResponseのbody(HTML)を解決してcontent要素からJSONファイルを取り出す
 * - JSONファイルから特定のプロパティを取り出す（その際id情報が必要である)
 * 
 * 
 * */ 
export const resolveProcess: iAssemblerResolveProcess<iIllustData> = async function(
    this: AssembleParallelPageSequences<iIllustData>,
    index: number,
    responses: (puppeteer.HTTPResponse | any)[],
    id: number
) {
    // src/components/collectArtworkPage/httpResponseResolver.tsと同じ
    // 
    // Pop out first element of responses.
    const response: puppeteer.HTTPResponse = responses.shift();
    // Check if the response is valid.
    if(
        !response.headers().hasOwnProperty("content-type")
        || !response.headers()["content-type"]!.includes('text/html')
    ) throw new Error("Error: Cannot retrieve HTTP Response body.");

    // Resolving HTTPResponse body data as iMetaPreloadData | undefined
    const { document } = new JSDOM(await response.text()).window;
    const json = document.querySelector('#meta-preload-data')!.getAttribute("content");
    const metaPreloadData: iMetaPreloadData | undefined = json ? JSON.parse(json): undefined;

    if(metaPreloadData !== undefined && metaPreloadData.illust[id] !== undefined) 
        return [metaPreloadData.illust[id] as iIllustData];
    else 
        throw new Error("Error: Cannot retrieve 'illust' property from metadata");
};