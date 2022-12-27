/***************************************************************
 * page.goto("next-result-page-url")
 * --> responses: puppeteer.HTTPResponse[]
 * --> resolveProcess(responses)
 * --> resolved: iIllustMangaDataElement[]
 * returns resolved.
 * *************************************************************/ 
import type puppeteer from 'puppeteer';
import type { iIllustMangaDataElement, iBodyIncludesIllustManga } from '../../constants/illustManga';
import type { iAssemblerResolveProcess } from '../AssembleParallelPageSequences-2';
import type { AssembleParallelPageSequences } from '../AssembleParallelPageSequences-2';
import { retrieveDeepProp } from '../../utilities/objectModifier';



export const resolveProcess: iAssemblerResolveProcess<iIllustMangaDataElement> = async function(
    this: AssembleParallelPageSequences<iIllustMangaDataElement>,
    index: number,
    responses: (puppeteer.HTTPResponse | any[])[]
) {
    const element = responses.shift() as puppeteer.HTTPResponse;
    if(element === undefined) throw new Error("");
    const r = await element.json() as iBodyIncludesIllustManga;
    const resolved: iIllustMangaDataElement[] = retrieveDeepProp<iIllustMangaDataElement[]>(["body", "illustManga", "data"], r);
    if(resolved === undefined) throw new Error("");
    return resolved;
};