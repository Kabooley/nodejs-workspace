import * as puppeteer from 'puppeteer';
import yargs from 'yargs/yargs';
import { commandName, commandDesc, builder } from './cliParser';

interface iCommand {
    [key: string]: string | undefined;
}

let browser: puppeteer.Browser;
const commands: iCommand = {};

yargs(process.argv.slice(2)).command(commandName, commandDesc, 
    {...builder},   // {...builder}とするのと、buidlerに一致するinterfaceが必須となっている...
    (args) => {
        console.log(`username: ${args.username}. password: ${args.password}. keyword: ${args.keyword}`);
        commands['username'] =args.username;
        commands['password'] =args.password;
        commands['keyword'] =args.keyword;
        console.log(commands);
}).argv;

(async function(commands) {
    try {
        browser = await puppeteer.launch();
        const loginPage = await browser.newPage();
    }
    catch(e) {
        console.error(e);
        // TODO: Fix this.
        if(browser !== undefined) browser.close();
    }
})(commands);