import * as puppeteer from 'puppeteer';
import yargs from 'yargs/yargs';
import { commandName, commandDesc, builder } from './cliParser';

interface iCommand {
    [key: string]: string | undefined;
}
export const commands: iCommand = {};

yargs(process.argv.slice(2)).command(commandName, commandDesc, 
    {...builder},   // {...builder}とするのと、buidlerに一致するinterfaceが必須となっている...
    (args) => {
        console.log(`username: ${args.username}. password: ${args.password}. keyword: ${args.keyword}`);
        commands['username'] =args.username;
        commands['password'] =args.password;
        commands['keyword'] =args.keyword;
        console.log(commands);
}).argv;


console.log(commands);