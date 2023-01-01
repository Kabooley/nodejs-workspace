import * as puppeteer from 'puppeteer';
import { Navigation } from './Navigation';

const initialize = async (browser: puppeteer.Browser): Promise<puppeteer.Page> => {
    const page: puppeteer.Page | undefined = (await browser.pages())[0];
    if(!page) throw new Error("Cannot find first tab of browser");
    await page.setViewport({ width: 1920, height: 1080 });
    return page;
};
 
const browserOptions: puppeteer.PuppeteerLaunchOptions = {
    headless: true,
    args: ['--disable-infobars'],
    userDataDir: "./userdata/",
    handleSIGINT: true,
    slowMo: 150,
};

const oldUrl = `https://www.pixiv.net/ajax/search/artworks/{{escapedKeyword}}?word={{escapedKeyword}}`;

(async function() {
    
    const browser = await puppeteer.launch(browserOptions);
    const page = await initialize(browser);

    try {
        // await login(page, 
        //     {
        //         username: "",
        //         password: ""
        // });
        const navigator = new Navigation();
        navigator.resetFilter(
            // failed: フルURL
            // function filter(res: puppeteer.HTTPResponse) {
            //     return res.status() === 200 && res.url().includes("https://www.pixiv.net/ajax/search/artworks/%E3%82%AC%E3%83%AB%E3%83%91%E3%83%B310000users%E5%85%A5%E3%82%8A?word=%E3%82%AC%E3%83%AB%E3%83%91%E3%83%B310000users%E5%85%A5%E3%82%8A&order=date_d&mode=all&p=1&s_mode=s_tag&type=all&lang=ja");
            // }
            // failed:
            // function filter(res: puppeteer.HTTPResponse) {
            //     return res.status() === 200 && res.url().includes("https://www.pixiv.net/ajax/search/artworks/%E3%82%AC%E3%83%AB%E3%83%91%E3%83%B310000users%E5%85%A5%E3%82%8A");
            // }
            // failed: short url ver and arrow function
            // (res: puppeteer.HTTPResponse) => {
            //     return res.status() === 200 && res.url().includes("https://www.pixiv.net/ajax/search/artworks/%E3%82%AC%E3%83%AB%E3%83%91%E3%83%B310000users%E5%85%A5%E3%82%8A");
            // }
            // これは通る
            // URLの問題だなこりゃ
            (res: puppeteer.HTTPResponse) => {
                return res.status() === 200 && res.url().includes("https://www.pixiv.net/");
            }
        );
        // navigator.resetFilter(
        //     function (res: puppeteer.HTTPResponse) {
        //         return res.status() === 200;
        //     }
        // )
            
        const navigateResult: (puppeteer.HTTPResponse | any)[] = await navigator.navigateBy(
            page, 
            page.goto(
                "https://www.pixiv.net/tags/%E3%82%AC%E3%83%AB%E3%83%91%E3%83%B310000users%E5%85%A5%E3%82%8A/artworks?p=1&s_mode=s_tag", 
                { waitUntil: ["load", "networkidle2"]}
        ));

        for(const r of navigateResult) {
            console.log(r);
            console.log(r.url());
            console.log(r.status());
        }
    }
    catch(e) {
        await page.screenshot({type: "png", path: "./dist/error.png"});
        console.error(e);
    }
    finally {
        await page.close();
        await browser.close();
    }
})();