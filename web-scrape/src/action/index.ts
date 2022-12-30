import type * as fs from 'fs';
import type * as http from 'http';
import type puppeteer from 'puppeteer';
import Action from './Action';
import type { iActionClosure } from './Action';
import type { StreamOptions } from '../action/Action';


export type iDownloadOptionGenerator<T> = (data: T) => {dest: fs.PathLike, httpRequestOption: http.RequestOptions, options: StreamOptions };

export const downloader = <T>(optionGenerator: iDownloadOptionGenerator<T>): iActionClosure<T> => {
    return function(data: T): void {
        const { dest, httpRequestOption, options } = optionGenerator(data);
        return new Action().download(dest, httpRequestOption, options);
    }
};

export const bookmarker = <T>(page: puppeteer.Page, selector: string): iActionClosure<T> => {
    return function(data: T): Promise<void> {
        // TODO: dataは不要なんだけど消費しなくてはならない
        console.log(`bookmarker ${data}`);
        return new Action().bookmark(page, selector);
    }
};
