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
        await instances.initialize();
        const page = instances.getPage();
        
        // Incase need to login.
        // await login(page, { username: username, password: password});
        
        await page.goto("https://www.pixiv.net/", { waitUntil: ["load", "networkidle2"]});
        setupTaskQueue(orders);
        const result = await sequentialAsyncTasks(taskQueue);

        // DEBUG:
        console.log(result);
    }
    catch(e) {
        console.error(e);
    }
    finally {
        console.log("Browser and page instances are closed explicitly");
        await instances.getPage()!.screenshot({type: "png", path: "./dist/errorCollectFromResultPage.png"});
        await instances.closeAll();
    }
})();

// -- LEGACY --

// import * as puppeteer from 'puppeteer';
// import * as fs from 'fs';
// import yargs from 'yargs/yargs';
// import { commandName, commandDesc, builder } from './cliParser';
// import { initialize } from './helper/initialize';
// import { search } from './components/search';
// import { collectFromSearchResult } from './components/collectFromResultPage';
// import type { iBodyIncludesIllustManga } from './components/Collect';
// import { collectArtworkData } from './components/collectFromArtworkPage';
// import { commands } from './commandParser/index';
// import type { iCommands } from './commandParser/index';
// // import { login } from './components/login';

// // 
// // -- TYPES --
// // 
// interface iCommand {
//     [key: string]: string | undefined;
// }

// // 
// // -- GLOBALS --
// // 
// let browser: puppeteer.Browser | undefined;
// let page: puppeteer.Page | undefined;
// let escapedKeyword: string = "";
// const options: puppeteer.PuppeteerLaunchOptions = {
//     headless: true,
//     args: ['--disable-infobars'],
//     userDataDir: "./userdata/",
//     handleSIGINT: true,
//     slowMo: 150,
// };

// const isObjectEmpty = (o: object): boolean => {
//     return Object.keys(o).length === 0 ? true : false; 
// };

// const 

// // 
// // 
// const checkCommands = (c: iCommands) => {
//     const { argv, collectOptions, bookmarkOptions } = c;
//     if(!isObjectEmpty(collectOptions)) {
//         // There is order to 'collect'
//         // Retrieve sub command
//         const {_} = argv;
        
//     }
//     if(!isObjectEmpty(bookmarkOptions)) {
//         // There is order to 'bookmark'
//     }
// }; 

// // 
// // -- MAIN PROCESS --
// // 
// (async function() {
//     try {


//         browser = await puppeteer.launch(options);
//         page = await initialize(browser);
        
//         // しばらくログイン状態...
//         // await login(page, { username: username, password: password});
//         await page.goto("https://www.pixiv.net/", { waitUntil: ["load", "networkidle2"]});

//         const searchResult: iBodyIncludesIllustManga = await search(page, keyword);

//         // DEBUG:
//         console.log(searchResult);
        
//         const ids: string[] = await collectFromSearchResult(page, searchResult, 'id', (r) => {return r.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
//         && r.status() === 200});

//         // DEBUG:
//         console.log(ids);

//         const artworksData = await collectArtworkData(browser, page, ids);

//         // DEBUG:一旦JSONファイルで保存
//         // DB導入検討
//         console.log("Save reulst as JSON file");
//         const artworksDataFile = JSON.stringify({
//             date: new Date(),
//             keyword: keyword,
//             data: [...artworksData]
//         });
//         if(fs.existsSync("../collected/")){
//             fs.writeFileSync(`../collected/artworkdData-${keyword}-${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}.json`, artworksDataFile, {encoding: 'utf8'});
//         }
//         else if(fs.existsSync("./collected/")){
//             fs.writeFileSync(`./collected/artworkdData-${keyword}-${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}.json`, artworksDataFile, {encoding: 'utf8'});
//         };
//     }
//     catch(e) {
//         console.error(e);
//     }
//     finally{
//         console.log("Browser and page are closed explicitly");
//         await page!.screenshot({type: "png", path: "./dist/errorCollectFromResultPage.png"});
            
//         if(page !== undefined) {
//             await page.close();
//             page = undefined;
//         };
//         if(browser !== undefined) {
//             await browser.close();
//             browser = undefined;
//         };
//     }
// })();