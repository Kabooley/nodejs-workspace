import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import yargs from 'yargs/yargs';
import { commandName, commandDesc, builder } from './cliParser';
import { initialize } from './helper/initialize';
import { search } from './components/search';
import { collectFromSearchResult } from './components/collectFromResultPage';
import type { iBodyIncludesIllustManga } from './components/Collect';
import { collectArtworksData } from './components/collectFromArtworkPage';
import { createRequestInterceptor } from './components/Interceptor';
import type { iRequestInterceptor } from './components/Interceptor';
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
let interceptor: iRequestInterceptor | undefined;
let escapedKeyword: string = "";
const commands: iCommand = {};
const options: puppeteer.PuppeteerLaunchOptions = {
    headless: true,
    args: ['--disable-infobars'],
    userDataDir: "./userdata/",
    handleSIGINT: true,
    slowMo: 150,
};
function interceptsSearchResult(event: puppeteer.HTTPRequest) {
    if(event.isInterceptResolutionHandled())return;
    console.log("-");
    if(event.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)){
        console.log(event.url());
    }
    event.continue();
};
function interceptsArtworkPage(event: puppeteer.HTTPRequest) {
    if(event.isInterceptResolutionHandled())return;
    console.log("--");
    // 正規表現に
    if(event.url().includes(`https://www.pixiv.net/artworks/`)){
        console.log(event.url());
    }
    event.continue();
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
        interceptor = createRequestInterceptor(page);
        interceptor.run();
        
        // しばらくログイン状態...
        // await login(page, { username: username, password: password});
        await page.goto("https://www.pixiv.net/", { waitUntil: ["load", "networkidle2"]});

        const searchResult: iBodyIncludesIllustManga = await search(page, keyword);
        
        interceptor.removeDefault();
        interceptor.add(interceptsSearchResult);
        const ids: string[] = await collectFromSearchResult(page, searchResult, 'id', (r) => {return r.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
        && r.status() === 200});
        interceptor.remove(interceptsSearchResult);
        interceptor.addDefault();

        // DEBUG:
        console.log(ids);

        interceptor.removeDefault();
        interceptor.add(interceptsArtworkPage);
        const artworksData = await collectArtworksData(page, ids);
        interceptor.remove(interceptsArtworkPage);
        interceptor.addDefault();

        // DEBUG:一旦JSONファイルで保存
        console.log("Save reulst as JSON file");
        const artworksDataFile = JSON.stringify({
            date: new Date(),
            keyword: keyword,
            data: [...artworksData]
        });
        if(fs.existsSync("../collected/")){
            fs.writeFileSync(`../collected/artworkdData-${keyword}-${new Date()}.json`, artworksDataFile, {encoding: 'utf8'});
        }
        else if(fs.existsSync("./collected/")){
            fs.writeFileSync(`./collected/artworkdData-${keyword}-${new Date()}.json`, artworksDataFile, {encoding: 'utf8'});
        };
    }
    catch(e) {
        console.error(e);
    }
    finally{
        console.log("Browser and page are closed explicitly");
        interceptor?.removeAll();
        interceptor = undefined;
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
