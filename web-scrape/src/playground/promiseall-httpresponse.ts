/**************************************************************
 * TEST: Make sure promise.all returns what I expected array of HTTPResponses.
 * 
 * TODO: HTTPResponseにbodyにデータがあるのかどうかの調査をどうやって実装すればいいのか
 * TODO: 
 * 
 * 健全artworkページにgoto()してそのレスポンスを調べよう。
 * 
 * めんどくさいTypeScriptコンパイルコマンド
 * TODO: tsconfigを指定するCLIってなんだっけ？確認。
 * ```bash
 * $ npx tsc <FILEPATH> --
 * ```
 * ************************************************************/ 
import * as puppeteer from 'puppeteer'
import { initialize } from '../helper/initialize';
import { Navigation } from "../components/Navigation";

let browser : puppeteer.Browser | undefined;
let page : puppeteer.Page | undefined;
let navigation: Navigation | undefined;
const options: puppeteer.PuppeteerLaunchOptions = {
    headless: true,
    args: ['--disable-infobars'],
    userDataDir: "./userdata/",
    handleSIGINT: true,
    slowMo: 150,
};
const url: string = "https://www.pixiv.net/artworks/39189162";

const httpResponseFilter = (r: puppeteer.HTTPResponse): boolean => {
    console.log(r.url());
    console.log(r.status());
    // そもそもこのＵＲＬ指定が間違っているかも...
    return r.status() === 200 && r.url().includes(url);
};


(async function(browser, page, navigation) {
    try {

        browser = await puppeteer.launch(options);
        page = await initialize(browser);
        if(!page && page !== undefined) throw new Error("Page is not generated.");
        navigation = new Navigation(page);
        navigation.resetWaitForResponseCallback(page.waitForResponse(httpResponseFilter));

        const result: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(function() {
            return page!.goto(url);
        });

        result.forEach(r => {
            (async function() {
                // NOTE: このガードは`.json()`メソッドを含むかでしかない
                // 実際にrにbodyが含まれているかどうかの調査はできない
                if(r !== undefined && r && typeof r["json"] !== "function"){
                    // HTTPResponse.json() throw Error if response body is not parsable by `JSON.parse()` 
                    // 
                    // JSON.parse()は引数が有効なJSONデータでない場合に
                    // SyntaxErrorを投げる
                    console.log(await r.json());
                }
            })();
        })
    }
    catch(e) {

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
})(browser, page, navigation);