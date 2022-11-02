import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import yargs from 'yargs/yargs';
import { commandName, commandDesc, builder } from './cliParser';
import { initialize } from './helper/initialize';
import { search } from './components/search';
import { collectFromSearchResult } from './components/collectFromResultPage';
import type { iBodyIncludesIllustManga } from './components/Collect';
import { collectArtworkData } from './components/collectFromArtworkPage';
import { commands } from './commandParser/index';
import type { iCommands } from './commandParser/index';
// import { login } from './components/login';

// 
// -- TYPES --
// 
interface iCommand {
    [key: string]: string | undefined;
}

// 
// -- GLOBALS --
// 
let browser: puppeteer.Browser | undefined;
let page: puppeteer.Page | undefined;
let escapedKeyword: string = "";
const options: puppeteer.PuppeteerLaunchOptions = {
    headless: true,
    args: ['--disable-infobars'],
    userDataDir: "./userdata/",
    handleSIGINT: true,
    slowMo: 150,
};

const isObjectEmpty = (o: object): boolean => {
    return Object.keys(o).length === 0 ? true : false; 
};

const 

// 
// 
const checkCommands = (c: iCommands) => {
    const { argv, collectOptions, bookmarkOptions } = c;
    if(!isObjectEmpty(collectOptions)) {
        // There is order to 'collect'
        // Retrieve sub command
        const {_} = argv;
        
    }
    if(!isObjectEmpty(bookmarkOptions)) {
        // There is order to 'bookmark'
    }
}; 

// 
// -- MAIN PROCESS --
// 
(async function() {
    try {


        browser = await puppeteer.launch(options);
        page = await initialize(browser);
        
        // しばらくログイン状態...
        // await login(page, { username: username, password: password});
        await page.goto("https://www.pixiv.net/", { waitUntil: ["load", "networkidle2"]});

        const searchResult: iBodyIncludesIllustManga = await search(page, keyword);

        // DEBUG:
        console.log(searchResult);
        
        const ids: string[] = await collectFromSearchResult(page, searchResult, 'id', (r) => {return r.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
        && r.status() === 200});

        // DEBUG:
        console.log(ids);

        const artworksData = await collectArtworkData(browser, page, ids);

        // DEBUG:一旦JSONファイルで保存
        // DB導入検討
        console.log("Save reulst as JSON file");
        const artworksDataFile = JSON.stringify({
            date: new Date(),
            keyword: keyword,
            data: [...artworksData]
        });
        if(fs.existsSync("../collected/")){
            fs.writeFileSync(`../collected/artworkdData-${keyword}-${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}.json`, artworksDataFile, {encoding: 'utf8'});
        }
        else if(fs.existsSync("./collected/")){
            fs.writeFileSync(`./collected/artworkdData-${keyword}-${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}.json`, artworksDataFile, {encoding: 'utf8'});
        };
    }
    catch(e) {
        console.error(e);
    }
    finally{
        console.log("Browser and page are closed explicitly");
        await page!.screenshot({type: "png", path: "./dist/errorCollectFromResultPage.png"});
            
        if(page !== undefined) {
            await page.close();
            page = undefined;
        };
        if(browser !== undefined) {
            await browser.close();
            browser = undefined;
        };
    }
})();