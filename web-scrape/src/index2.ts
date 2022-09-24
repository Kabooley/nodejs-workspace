import * as puppeteer from 'puppeteer';
import yargs from 'yargs/yargs';
import { commandName, commandDesc, builder } from './cliParser';
import { initialize } from './helper/initialize';
import { login } from './components/login';
import { search } from './components/search';
import { triggerByClick, triggerByKeypress } from './helper/triggers';
import { Collect } from './components/collect';
import { Navigation } from './components/Navigation';
import type { iIllustMangaElement } from './components/collect';
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
let page: puppeteer.Page | undefined;
let escapedKeyword: string = "";
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
        escapedKeyword = encodeURIComponent(keyword);

        browser = await puppeteer.launch(options);
        page = await initialize(browser);
        
        await login(page, { username: username, password: password});
        await search(page, keyword);

        // やっぱり囲った部分はsearch()に含むのがいいなぁ----
        let navigation = new Navigation(page, triggerByKeypress(page));
        navigation.push(page.waitForResponse((res) => {return res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
        && res.status() === 200}));
        const [res, ...rest] = await navigation.navigate();
        navigation = null;

        if(!res || !(await res.json())) throw new Error("Unexpected value has been returned after navigation");
        // ----------------------------------------------

        let result = await res.json().illustManga;

        if(!result || !result.data || !result.total) throw new Error("Cannot capture illustManga data.");

        // --- 囲った部分まとめられる --------------------------
        let collect = new Collect<iIllustMangaElement>();
        navigation = new Navigation(page, triggerByClick(page, selectors.nextPage), {waitUntile: ["load", "networkidle02"]});
        navigation.push(page.waitForResponse((res) => {return res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
        && res.status() === 200}));
        let currentPage: number = 1;    // 0にしておかないとwhile()が機能しない
        let lastPage: number = 0;       // 1にしておかないとwhile()が機能しない
        let data: string[] = [];        // stringを前提にしているよ
        lastPage = result.total / result.data.length;

        while(currentPage < lastPage) {
            collect.resetData(result.data);
            data = [...data, ...collect.execute('id')];
            const [res] = await navigation.navigate();
            if(!res || !(await res.json())) throw new Error("Unexpected value has been returned after navigation");
            result = await res.json().illustManga;
            if(!result || !result.data || !result.total) throw new Error("Cannot capture illustManga data.");
            collect.resetData(result.data);
            currentPage++;
        };
        // -----------------------------------------------------
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
