/***********************************************
 * NEW COMMAND: "bookmark"
 * 
 * LIKE THIS.
 * ```bash
 * $ node index.ts bookmark \
 *  --amountOfBookmarkOver=5000 \
 *  --tag=COWBOYBEBOP \
 *  --author=awesomeCreator \
 * ```
 * 
 * TODO: 
 * - モジュール化するにあたって
 * - wrapHandlerは機能するか確認
 * *********************************************/ 
 import type yargs from 'yargs';
 // import Yargs from 'yargs/yargs';
 
 const bookmarkOptionList = ["bookmarkOver", "tag", "author"];
 
export interface iBookmarkOptions {
     bookmarkOver?: number;
     tag?: string;
     author?: string;
 };
 
 type iCommandBuild<T> = {
     [Property in keyof T]: yargs.Options;
 };
 
 const command = "bookmark";
 
 const description = "Bookmark artwork if it satifies given command options.";
 
 const bookmarkCommandBuilder: iCommandBuild<iBookmarkOptions> = {
     bookmarkOver: {
         describe: "Specify artwork number of Bookmark",
         demandOption: true,
         type: "number"
     },
     tag: {
         describe: "Specify tag name must be included",
         demandOption: false,
         type: "string"
     },
     author: {
         describe: "Specify author name that msut be included",
         demandOption: false,
         type: "string"
     }
 };
 
 const wrapHandler = (options: {[key: string]: any}) => {
     return <T extends {[key: string]: yargs.Options}>(
         args: yargs.ArgumentsCamelCase<yargs.InferredOptionTypes<T>>
         ): void => {
         Object.keys(args).forEach(key=> {
             if(bookmarkOptionList.includes(key)) options[key] = args[key];
         });

        //  DEBUG:
        console.log("bookmark command handler");
        console.log(args);
        console.log(options);
     };
 }
 
 export const bookmarkCommand = {
     command: command, 
     description: description,
     builder: bookmarkCommandBuilder,
     handlerWrapper: wrapHandler
 };
 
//  -- USAGE --
// import type yargs from 'yargs';
// import { bookmarkCommand } from './parser';
// import type { iBookmarkOptions } from './parser';
// import Yargs from 'yargs/yargs';

// (function() {
//     const commands = {} as iBookmarkOptions;
//     Yargs(process.argv.splice(2)).command(
//         bookmarkCommand.command,
//         bookmarkCommand.description,
//         bookmarkCommand.builder,
//         bookmarkCommand.handlerWrapper(commands)
//     ).argv;
//     console.log(commands);
// })();