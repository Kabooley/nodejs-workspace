import * as puppeteer from 'puppeteer';
import yargs from 'yargs/yargs';
import { commandName, commandDesc, builder } from './cliParser';
import { login } from './components/login';
import { search } from './components/search';
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
    headless: true
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
// -- MAIN PROCESS --
// 
(async function() {
    try {
        const {username, password, keyword} = commands;
        if(!username || !password || !keyword) throw new Error("command option is required");

        browser = await puppeteer.launch(options);
        // launch()した時点でタブはすでに生成されている。newPage()禁止。
        const page: puppeteer.Page | undefined = (await browser.pages())[0];
        if(!page) throw new Error("Open tab was not exist!!");

        await login(page, {username: username, password: password});

        // DEBUG: make sure succeeded so far.
        console.log(page.url());

        await search(page, keyword);
        // DEBUG: make sure succeeded so far.
        console.log(page.url());
    }
    catch(e) {
        console.error(e);
    }
    finally{
        console.log("browser closed explicitly");
        if(browser !== undefined) await browser.close();
    }
})();