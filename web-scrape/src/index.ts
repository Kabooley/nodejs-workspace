import * as puppeteer from 'puppeteer';
import yargs from 'yargs/yargs';
import { commandName, commandDesc, builder } from './cliParser';
import { initialize } from './helper/initialize';
import { search } from './components/search';
import { collectFromSearchResult } from './components/collectFromResultPage';
import type { iBodyIncludesIllustManga } from './components/Collect';
import { collectArtworksData } from './components/collectFromArtworkPage';
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
const commands: iCommand = {};
const options: puppeteer.PuppeteerLaunchOptions = {
    headless: true,
    args: ['--disable-infobars'],
    userDataDir: "./userdata/",
    handleSIGINT: true,
    slowMo: 150,
};

// 
// -- COMMAND MANAGER --
// 
yargs(process.argv.slice(2)).command(commandName, commandDesc, 
    {...builder},   // {...builder}とするのと、builderに一致するinterfaceが必須となっている...
    (args) => {
        console.log(`username: ${args.username}. password: ${args.password}. keyword: ${args.keyword}`);
        commands['username'] =args.username;
        commands['password'] =args.password;
        commands['keyword'] =args.keyword;
        escapedKeyword = encodeURIComponent(args.keyword!);
        console.log(commands);
}).argv;



// 
// -- MAIN PROCESS --
// 
(async function() {
    try {
        const {username, password, keyword} = commands;
        if(!username || !password || !keyword) throw new Error("command option is required");

        browser = await puppeteer.launch(options);
        page = await initialize(browser);
        
        // しばらくログイン状態...
        // await login(page, { username: username, password: password});
        await page.goto("https://www.pixiv.net/", { waitUntil: ["load", "networkidle2"]});

        const searchResult: iBodyIncludesIllustManga = await search(page, keyword);
        const ids: string[] = await collectFromSearchResult(page, searchResult, 'id', (r) => {return r.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
        && r.status() === 200});

        // DEBUG:
        console.log(ids);

        // So far so good.

        const artworksData = await collectArtworksData(page, ids);

        // DEBUG:一旦JSONファイルで保存しよう
        // console.log(artworksData);
    }
    catch(e) {
        console.error(e);
    }
    finally{
        console.log("Browser and page are closed explicitly");
        if(page !== undefined) {
            page = undefined;
        }
        if(browser !== undefined) {
            await browser.close();
            browser = undefined;
        }
    }
})();
