/**************************************************************
 * TEST: Make sure promise.all returns what I expected array of HTTPResponses.
 * 
 * 
 * ************************************************************/ 
import * as puppeteer from 'puppeteer'
import * as jsdom from 'jsdom';
import { initialize } from '../helper/initialize';
import { Navigation } from "../components/Navigation";
import { takeOutPropertiesFrom } from '../utilities/objectModifier';

interface iMetaPreloadData {
    timestamp: string;
    illust: iIllust;
};

interface iIllust {
    [key: string]: iIllustData;
};

interface iIllustData {
    illustId:string;
    illustTitle: string;
    illustComment: string;
    id: string;
    title: string;
    description: string;
    illustType: number;
    createDate: string;
    uploadDate: string;
    sl: number;
    urls: {
        mini: string;
        thumb: string;
        small: string;
        regular: string;
        original: string;
    },
    tags: {};
    pageCount: number;
    bookmarkCount: number;
    likeCount:number;
}


let browser : puppeteer.Browser | undefined;
let page : puppeteer.Page | undefined;
let navigation: Navigation | undefined;
const { JSDOM } = jsdom;
const options: puppeteer.PuppeteerLaunchOptions = {
    headless: true,
    args: ['--disable-infobars'],
    userDataDir: "./userdata/",
    handleSIGINT: true,
    slowMo: 150,
};



const url: string = "https://www.pixiv.net/artworks/39189162";
const requirement: (keyof iIllustData)[] = [
    "illustId", "illustTitle", "id", "title", "illustType", "urls", "pageCount", "bookmarkCount"
];


export const temporary = async function() {
    try {

        browser = await puppeteer.launch(options);
        page = await initialize(browser);
        if(!page && page !== undefined) throw new Error("Page is not generated.");
        navigation = new Navigation(page);


        // 
        const result: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(function() {
            return page!.goto(url, {waitUntil: ["load", "domcontentloaded"]});
        });

        // Promise.all()???????????????????????????????????????????????????
        const response: puppeteer.HTTPResponse = result.pop();
        let metaPreloadData: iMetaPreloadData | undefined;
        let illustData: iIllustData | undefined;
        
        if(response.headers().hasOwnProperty("content-type") && response.headers()["content-type"]!.includes('text/html')){
            const { document } = new JSDOM(await response.text()).window;
            const json = document.querySelector('#meta-preload-data')!.getAttribute("content");
            metaPreloadData = json ? JSON.parse(json): undefined;
        };

        // ????????????
        console.log(metaPreloadData);

        if(
            metaPreloadData !== undefined 
            && metaPreloadData!.hasOwnProperty("illust")
            && metaPreloadData.illust["39189162"] !== undefined
        ) {
            illustData = takeOutPropertiesFrom<iIllustData>(metaPreloadData.illust["39189162"], requirement);
        };

        // OK
        console.log(illustData);
    }
    catch(e) {
        await page!.screenshot({type: "png", path: "./dist/error.png"});
        console.error(e);
    }
    finally {
        if(navigation !== undefined) {
            navigation = undefined;
        }
        if(page !== undefined){
            await page.close();
            page = undefined;
        };
        if(browser !== undefined) {
            await browser.close();
            browser = undefined;
        };
    }
};
