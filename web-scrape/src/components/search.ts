import type puppeteer from 'puppeteer';
import { selectors } from '../constants/selectors';

export const search = (page: puppeteer.Page, keyword: string): Promise<void> => {
    return page.type(selectors.searchBox, keyword, { delay: 100 })
};