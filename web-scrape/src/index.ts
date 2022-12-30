/*********************************************************************************
 * index.ts
 * 
 * TODO:
 * - 機能の分割（1ファイル1機能）
 * instancesモジュールとか別ファイルに切り出していいよね。
 * - ログの文面の統一化。どこの何なのかさっぱりだ。
 * 
 * NOTE:
 * - いつもログインなしでセッションが続いているわけではないので再ログインは手動でコード修正
 * *******************************************************************************/ 
import * as puppeteer from 'puppeteer';
import { initialize } from './helper/initialize';
import { orders, iOrders } from './commandParser/index';
import type { iSequentialAsyncTask } from './utilities/TaskQueue';
import { sequentialAsyncTasks } from './utilities/TaskQueue';
import { Navigation } from './components/Navigation';
// import { setupCollectByKeywordTaskQueue } from './components/setupCollectByKeywordTaskQueue';
// import type { iCollectOptions } from './commandParser/commandModules/collectCommand';
import { login } from './components/login';

import { setupCollectByKeywordTaskQueue } from './components/collectResultPage';


// 
// -- GLOBALS --
// 
const browserOptions: puppeteer.PuppeteerLaunchOptions = {
    headless: true,
    args: ['--disable-infobars'],
    userDataDir: "./userdata/",
    handleSIGINT: true,
    slowMo: 150,
};
// taskQueue will be built by setupTaskQueue().
let taskQueue: iSequentialAsyncTask[] = [];

/**
 * Puppeteer instances contained module.
 * 
 * */ 
const instances = (function() {
    let browser: puppeteer.Browser | undefined;
    let page: puppeteer.Page | undefined;

    return {
        initialize: async function() {
            browser = await puppeteer.launch(browserOptions);
            page = await initialize(browser);
        },
        getBrowser: function(): puppeteer.Browser {
            if(browser !== undefined) {
                return browser;
            }
            else throw new Error("Error: puppeteer Browser instance is not instantiated yet.");
        },
        getPage: function(): puppeteer.Page {
            if(page !== undefined) {
                return page;
            }
            else throw new Error("Error: puppeteer page instance is not instantiated yet.");
        },
        closeAll: async function() {
            if(browser !== undefined) {
                await browser.close();
                browser = undefined;
            }
            if(page !== undefined) {
                await page.close();
                page = undefined;
            }
        }
    }
})();


const setupTaskQueue = (order: iOrders) => {

    // DEBUG: 
    console.log("setupTaskQueue():");

    const { commands, options } = order;
    switch(commands.join('')) {
        case 'collectbyKeyword':
            // DEBUG:
            console.log("case: 'collect byKeyword'");

            taskQueue = [...setupCollectByKeywordTaskQueue(
                instances.getBrowser(), 
                instances.getPage(), 
                {...options}
            )];
        break;
        case 'collectfromBookmark':
            // TODO: Define taskQueue implementation.
        break;
        case 'bookmark':
            // TODO: Define taskQueue implementation.
        break;
        default:
            // TODO: Define default behavior.
    };
};


(async function() {
    try {
        // DEBUG:
        console.log("index.ts: Let's begin.");
        console.log("index.ts: Received Commands...");
        console.log(orders);

        await instances.initialize();
        const page = instances.getPage();
        const navigation = new Navigation();
        
        // Incase need to login ---
        // await login(page, { 
        //     username: "ichitose.fourseasons@gmail.com", 
        //     password: "LockDanteSlash11_"
        // });
        // ----
        
        const navigateResult: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(page, page.goto("https://www.pixiv.net/", { waitUntil: ["load", "networkidle2"]}));
        const response: puppeteer.HTTPResponse = navigateResult.pop();
        if(response.status() !== 200) throw new Error("Error: Failed to navigate to 'https://www.pixiv.net/'");

        // DEBUG:
        console.log("index.ts: GO");

        setupTaskQueue(orders);

        // DEBUG: 
        console.log("index.ts: Tasks are generated.");

        const result = await sequentialAsyncTasks(taskQueue);

        // DEBUG:
        console.log("index.ts: result...");
        console.log(result);
    }
    catch(e) {
        console.error(e);
    }
    finally {
        console.log("index.ts: Browser and page instances are closed explicitly");
        await instances.getPage()!.screenshot({type: "png", path: "./dist/finallyErrorHandler.png"});
        await instances.closeAll();
    }
})();