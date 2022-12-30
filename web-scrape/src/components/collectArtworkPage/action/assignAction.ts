import type puppeteer from 'puppeteer';
import type { iCommands } from '../../../action/Action';
import type { iDownloadOptionGenerator } from '../../../action/index';
import { downloader, bookmarker } from '../../../action/index';

type iActionClosure<T> = (data: T) => Promise<any> | any;


/***
 * NOTE: iIllustData型変数以外のiActionClosureが求める引数は、
 * ここですべて引数として取得しなくてはならない(ハードコードしなくてはならない)。
 * @param { iCommands } command -
 * @param { puppeteer.Page } page -
 * @param { string } selector - 
 * @param { iDownloadOptionGenerator<T> } optionGenerator - 
 * */ 
export const assignAction = <T>(
    command: iCommands, 
    page: puppeteer.Page, 
    selector: string, 
    optionGenerator: iDownloadOptionGenerator<T>
    ): iActionClosure<T> => {
        
        // DEBUG:
        console.log(`assignAction: ${command}`);

        switch(command) {
            case "bookmark": return bookmarker(page, selector);
            case "download": return downloader(optionGenerator);
            default: throw new Error("No such a action command");
        }
};