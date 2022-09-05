import * as puppeteer from 'puppeteer';
import yargs from 'yargs/yargs';
import { commandName, commandDesc, builder } from './cliParser';
import { login } from './components/login';

interface iCommand {
    [key: string]: string | undefined;
}

let browser: puppeteer.Browser | undefined;
const commands: iCommand = {};
const options: puppeteer.PuppeteerLaunchOptions = {
    headless: true
};

yargs(process.argv.slice(2)).command(commandName, commandDesc, 
    {...builder},   // {...builder}とするのと、builderに一致するinterfaceが必須となっている...
    (args) => {
        console.log(`username: ${args.username}. password: ${args.password}. keyword: ${args.keyword}`);
        commands['username'] =args.username;
        commands['password'] =args.password;
        commands['keyword'] =args.keyword;
        console.log(commands);
}).argv;

(async function() {
    try {
        browser = await puppeteer.launch(options);
        // launch()した時点でタブはすでに生成されている。newPage()禁止。
        const page: puppeteer.Page | undefined = (await browser.pages())[0];
        if(!page) throw new Error("Open tab was not exist!!");
        if(!commands['username'] || !commands['password']) throw new Error("command option is required");
        await login(page, {username: commands['username'], password: commands['password']});

        // DEBUG: make sure login is succeeded so far.
        await page.screenshot();

    }
    catch(e) {
        console.error(e);
        // browser.close() everytime error ocurred.
        // 
        // DEBUG: 明示的にbrowserを閉じたことを示す
        console.log("browser closed explicitly");
        if(browser !== undefined) browser.close();
    }
})();