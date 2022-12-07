/*********************************************************************************
 * index.ts
 * 
 * TODO:
 * - 機能の分割（1ファイル1機能）
 * instancesモジュールとか別ファイルに切り出していいよね。
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
import { setupCollectByKeywordTaskQueue } from './components/setupCollectByKeywordTaskQueue';
import type { iCollectOptions } from './commandParser/commandModules/collectCommand';
// import { login } from './components/login';


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
    const { commands, options } = order;
    switch(commands.join('')) {
        case 'collectbyKeyword':
            // DEBUG:
            // 
            console.log("Set up tasks according to command 'collect byeKeyword'");

            taskQueue = [...setupCollectByKeywordTaskQueue(instances.getBrowser(), instances.getPage(), {...options} as iCollectOptions)];
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
        console.log("Let's begin.");
        console.log(orders);

        await instances.initialize();
        const page = instances.getPage();
        const navigation = new Navigation();
        
        // Incase need to login.
        // await login(page, { username: username, password: password});
        
        const navigateResult: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(page, page.goto("https://www.pixiv.net/", { waitUntil: ["load", "networkidle2"]}));
        const response: puppeteer.HTTPResponse = navigateResult.pop();
        if(response.status() !== 200) throw new Error("Error: Failed to navigate to 'https://www.pixiv.net/'");

        // DEBUG:
        console.log("GO");

        setupTaskQueue(orders);

        // DEBUG: 
        console.log("Tasks are generated.");

        const result = await sequentialAsyncTasks(taskQueue);

        // TODO: 型が(iIllustMangaDataElement[keyof iIllustMangaDataElement])[]みたいなものになる...ように型情報の修正
        // DEBUG:
        console.log(result);
    }
    catch(e) {
        console.error(e);
    }
    finally {
        console.log("Browser and page instances are closed explicitly");
        await instances.getPage()!.screenshot({type: "png", path: "./dist/finallyErrorHandler.png"});
        await instances.closeAll();
    }
})();