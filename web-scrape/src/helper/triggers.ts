import type puppeteer from 'puppeteer';

export const triggerByKeypress = async (page: puppeteer.Page, key?: puppeteer.KeyInput): Promise<void> => {
    return page.keyboard.press(key ? key : 'Enter');
};

export const triggerByClick = async (page: puppeteer.Page, selector: string): Promise<void> => {
    return page.click(selector);
};

// トリガーじゃなかったわ
export const defaultWaitForResponsePromise = (page: puppeteer.Page) => {
    return page.waitForResponse((res: puppeteer.HTTPResponse) => res.status() === 200);
};

export const waitForResponsePromise = (page: puppeteer.Page, cb: (res: puppeteer.HTTPResponse) => Promise<boolean>) => {
    return page.waitForResponse(cb);
};

