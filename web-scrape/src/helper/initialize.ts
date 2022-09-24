import type puppeteer from 'puppeteer';

export const initialize = async (browser: puppeteer.Browser): Promise<puppeteer.Page> => {
    const page: puppeteer.Page | undefined = (await browser.pages())[0];
    if(!page) throw new Error("Cannot find first tab of browser");
    await page.setViewport({ width: 1920, height: 1080 });
    return page;
};