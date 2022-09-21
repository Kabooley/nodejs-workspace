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
const url: string = "https://www.pixiv.net/";

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

const getFirstTab = async (browser: puppeteer.Browser): Promise<puppeteer.Page> => {
        // launch()した時点でタブはすでに生成されている。newPage()禁止。
        const page: puppeteer.Page | undefined = (await browser.pages())[0];
        if(!page) throw new Error("Open tab was not exist!!");
        return page;
}

const pageSettings = async (page: puppeteer.Page): Promise<void> => {
        // screenshotとるときに情報が抜けると困るから大きい画面にしたい
        await page.setViewport({
            width: 1920,
            height: 1080
        });
};


// 
// -- MAIN PROCESS --: USING SESSION.
// 
(async function() {
    try {
        const {username, password, keyword} = commands;
        if(!username || !password || !keyword) throw new Error("command option is required");

        browser = await puppeteer.launch(options);
        const page: puppeteer.Page = await getFirstTab(browser);
        await pageSettings(page);

        console.log(`Accessing to ${url} ...`);

        // Navigate to the URL
        const [response] = await Promise.all([
            page.goto("https://www.pixiv.net/"),
            page.waitForNavigation({ waitUntil: ["load", "networkidle2"]})
        ]);
        if(!response || response.status() !== 200) throw new Error("Something went wrong while go to https://www.pixiv.net/");

        // DEBUG: make sure succeeded so far.
        console.log(`Logged into ${response.url()}`);
        console.log(await response.headers());

        // DEBUG: make sure succeeded so far.
        console.log(page.url());
        await page.screenshot({type: "png", path: "./dist/isSessionValid.png"});

        const res: puppeteer.HTTPResponse = await search(page, keyword);

        // DEBUG: make sure succeeded so far.
        console.log(await res.json());
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