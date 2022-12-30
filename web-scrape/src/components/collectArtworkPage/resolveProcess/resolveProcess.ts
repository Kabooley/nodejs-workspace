import type puppeteer from 'puppeteer';
import type { iMetaPreloadData, iIllustData } from '../typeOfArtworkPage';
import type { iAssemblerResolveProcess } from '../../AssembleParallelPageSequences-2';
import type { AssembleParallelPageSequences } from '../../AssembleParallelPageSequences-2';
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
 * - id情報は、JSONオブジェクトのプロパティ名が数値だけになることを利用して取り出している
 * */ 
export const resolveProcess: iAssemblerResolveProcess<iIllustData> = async function(
    this: AssembleParallelPageSequences<iIllustData>,
    index: number,
    responses: (puppeteer.HTTPResponse | any)[]
) {
    // DEBUG:
    console.log(`${index} resolveProcess`);
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

    // illust[id]の代わりに、metaPreloadDataのなかから数字だけのプロパティがあるかを探すことでiIllustDataへたどり着く方法にした。
    // TODO: 要確認

    if(metaPreloadData === undefined) throw new Error("Error: `metaPreloadData` is undefined.");

    let idKey: string | undefined = undefined;
    Object.keys(metaPreloadData).forEach(prop => {
        if(prop.match(/^[0-9]+$/)) idKey = prop;
    });

    if(idKey === undefined) throw new Error("Error: Cannot retrieve 'illust' property from metadata");

    // DEBUG: make sure idKey is definitley id string.
    console.log(`idKey: ${idKey}`);

    return [metaPreloadData.illust[idKey] as iIllustData];
};