import * as puppeteer from 'puppeteer';
import yargs from 'yargs/yargs';
import { commandName, commandDesc, builder } from './cliParser';
import { login } from './components/login';
// import { search } from './components/search';
import { Collect } from './components/Collect';
import { Navigation } from './components/Navigations';
import type { iIllustMangaElement } from './components/Collect';
import { selectors } from './constants/selectors';

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
let escapedKeyword: string = "";
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
        escapedKeyword = encodeURIComponent(args.keyword!);
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
// -- MAIN PROCESS --: ver.3
// 
(async function() {
    try {
        const {username, password, keyword} = commands;
        if(!username || !password || !keyword) throw new Error("command option is required");

        browser = await puppeteer.launch(options);
        const page: puppeteer.Page = await getFirstTab(browser);
        await pageSettings(page);

        // DEBUG:
        console.log(`Accessing to ${url} ...`);

        await login(page, { username: username, password: password});

        // DEBUG: make sure succeeded so far.
        await page.screenshot({type: "png", path: "./dist/isSessionValid.png"});

        // Type keyword into input form.
        await page.type(selectors.searchBox, keyword, { delay: 100 });
        
        let currentPage: number = 0;    // 0にしておかないとwhile()が機能しない
        let lastPage: number = 1;       // 1にしておかないとwhile()が機能しない
        let data: string[] = [];        // stringを前提にしているよ
                
        const cb = (res: puppeteer.HTTPResponse): boolean => {
            console.log(res.url());
            return res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
            && res.status() === 200
        };

        const nextResultPageTrigger = async (): Promise<void> => {
            await page.click(selectors.nextPage);
        }

        const keywordSearchTrigger = async (): Promise<void> => {
            await page.keyboard.press('Enter');
        };

        console.log(`Searching ${keyword}...`);

        while(currentPage < lastPage) {
            console.log(`Current page: ${currentPage}`)
            const res: puppeteer.HTTPResponse = await navigateToNextPage(
                page, 
                !currentPage ? keywordSearchTrigger : nextResultPageTrigger, 
                { waitForResponseCallback: cb }
            );
            const { illustManga } = await res.json();
            if(!illustManga || !illustManga.data || !illustManga.data.total)
                throw new Error("Unexpected HTTP response has been received");
            data = [...data, ...collectElementsAsArray<iIllustMangaElement>(illustManga.data, 'id')];
            if(currentPage === 0) {
                console.log("Initializing collecting result data...");
                // Update lastPage.
                lastPage = illustManga.data.length ? illustManga.data.total / illustManga.data.length : 1;
                // これはよくないやりかたですな...
                currentPage++;
            }
            currentPage++;
        }
    }
    catch(e) {
        console.error(e);
    }
    finally{
        console.log("browser closed explicitly");
        if(browser !== undefined) await browser.close();
    }
})();

// --- LEGACY ---
// 
// 
// // 
// // -- MAIN PROCESS --: ver.2
// // 
// (async function() {
//     try {
//         const {username, password, keyword} = commands;
//         if(!username || !password || !keyword) throw new Error("command option is required");

//         browser = await puppeteer.launch(options);
//         const page: puppeteer.Page = await getFirstTab(browser);
//         await pageSettings(page);

//         console.log(`Accessing to ${url} ...`);

//         // Navigate to the URL
//         // const [response] = await Promise.all([
//         //     page.goto(url),
//         //     page.waitForNavigation({ waitUntil: ["load", "networkidle2"]})
//         // ]);
//         // if(!response || response.status() !== 200) throw new Error(`Something went wrong while go to ${url}`);
//         // // DEBUG: make sure succeeded so far.
//         // console.log(`Logged into ${response.url()}`);
//         // console.log(await response.headers());

//         await login(page, { username: username, password: password});

//         // DEBUG: make sure succeeded so far.
//         await page.screenshot({type: "png", path: "./dist/isSessionValid.png"});

//         const res: puppeteer.HTTPResponse = await search(page, keyword);
//         const {illustManga} = await res.json();
//         if(!illustManga || !illustManga.data || !illustManga.total) 
//             throw new Error("Unexpected JSON data has been received");

        


//         // DEBUG: make sure succeeded so far.
//         console.log(await res.json());
//         console.log(page.url());
//         await page.screenshot({type: "png", path: "./dist/isSearchResult.png"});
        
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