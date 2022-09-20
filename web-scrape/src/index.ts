import * as puppeteer from 'puppeteer';
import yargs from 'yargs/yargs';
import { commandName, commandDesc, builder } from './cliParser';
// import { login } from './components/login';
import { search } from './components/search';
// import { collectIdsFromResultPages } from './components/collect';
// import { browserContextProcess } from './debug/closeAllBrowsers';

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
const commands: iCommand = {};
const options: puppeteer.PuppeteerLaunchOptions = {
    headless: true,
    args: ['--disable-infobars', ],
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
        console.log(commands);
}).argv;

// 
// -- MAIN PROCESS --: USING SESSION.
// 
(async function() {
    try {
        const {username, password, keyword} = commands;
        if(!username || !password || !keyword) throw new Error("command option is required");

        browser = await puppeteer.launch(options);
        // launch()した時点でタブはすでに生成されている。newPage()禁止。
        const page: puppeteer.Page | undefined = (await browser.pages())[0];
        if(!page) throw new Error("Open tab was not exist!!");

        // screenshotとるときに情報が抜けると困るから大きい画面にしたい
        await page.setViewport({
            width: 1920,
            height: 1080
        });

        // セッションなしだと
        await page.goto("https://www.pixiv.net/");
        await page.waitForNetworkIdle();

        // DEBUG: make sure succeeded so far.
        console.log(page.url());
        await page.screenshot({type: "png", path: "./dist/isSessionValid.png"});

        const res: puppeteer.HTTPResponse = await search(page, keyword);

        // DEBUG: make sure succeeded so far.
        console.log(res);
        console.log(page.url());
        await page.screenshot({type: "png", path: "./dist/isSearchResult.png"});
        
        // const ids: string[] = await collectIdsFromResultPages(page, keyword, res);
        // // DEBUG: make sure succeeded so far.
        // console.log(ids);

        
    }
    catch(e) {
        console.error(e);
    }
    finally{
        console.log("browser closed explicitly");
        if(browser !== undefined) await browser.close();
    }
})();

// // 
// // -- MAIN PROCESS --: INCASE LOGIN REQUIRED.
// // 
// (async function() {
//     try {
//         const {username, password, keyword} = commands;
//         if(!username || !password || !keyword) throw new Error("command option is required");

//         browser = await puppeteer.launch(options);
//         // launch()した時点でタブはすでに生成されている。newPage()禁止。
//         const page: puppeteer.Page | undefined = (await browser.pages())[0];
//         if(!page) throw new Error("Open tab was not exist!!");

//         await login(page, {username: username, password: password});

//         // DEBUG: make sure succeeded so far.
//         console.log(page.url());

//         const res: puppeteer.HTTPResponse = await search(page, keyword);
//         // DEBUG: make sure succeeded so far.
//         console.log(page.url());
//         const ids: string[] = await collectIdsFromResultPages(page, keyword, res);
//         // DEBUG: make sure succeeded so far.
//         console.log(ids);

        
//     }
//     catch(e) {
//         console.error(e);
//     }
//     finally{
//         console.log("browser closed explicitly");
//         if(browser !== undefined) await browser.close();
//     }
// })();