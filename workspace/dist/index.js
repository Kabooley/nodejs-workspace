"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/************************************************************
 *
 *
 * **********************************************************/
// import { bookmarkCommand } from './bookmarkCommand';
// import type { iBookmarkOptions } from './bookmarkCommand';
// import { collectCommand } from './collectCommand';
// import type { iCollectOptions } from './collectCommand';
const yargs_1 = __importDefault(require("yargs"));
// こいつをbuilder内部で呼び出すことで
// 入力されたコマンドの数などを検査できる
const checkCommand = (yargs, argv, requiredNumber) => {
    console.log(`-- ${requiredNumber} ----------------`);
    console.log(argv);
    console.log("----------------------");
};
// TODO: check this out.
let argu = (0, yargs_1.default)(process.argv.splice(2))
    .command("collect", "collect something", (yargs) => {
    const collectArgv = yargs
        .command("byKeyword", "collect something by keyword", {
        // Login ID
        username: {
            describe: "username",
            demandOption: true,
            type: "string",
        },
        // Login Password
        password: {
            describe: "password",
            demandOption: true,
            type: "string",
        },
        // Search keyword
        keyword: {
            describe: "keyword",
            demandOption: false,
            type: "string",
        }
    }, () => { })
        .command("fromBookmark", "collect something from bookmark", {
        // Login ID
        username: {
            describe: "username",
            demandOption: true,
            type: "string",
        },
        // Login Password
        password: {
            describe: "password",
            demandOption: true,
            type: "string",
        },
        // Search keyword
        keyword: {
            describe: "keyword",
            demandOption: false,
            type: "string",
        }
    }, () => { })
        .help('help')
        .wrap(null)
        .argv;
    checkCommand(yargs, collectArgv, 2);
}, (a) => {
    console.log("handler a");
    console.log(a);
})
    .command("bookmarkIt", "bookmark something", {
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
}, (a) => {
    console.log("handler b");
    console.log(a);
})
    .help().argv;
checkCommand(yargs_1.default, argu, 1);
console.log(argu);
// (function() {
//     const bookmarkOptions = {} as iBookmarkOptions; 
//     const collectOptions = {} as iCollectOptions; 
//     Yargs(process.argv.slice(2))
//     .command(
//         collectCommand.command,
//         collectCommand.description,
//         collectCommand.builder,
//         collectCommand.handlerWrapper(collectOptions),
//     )
//     .command(
//         bookmarkCommand.command,
//         bookmarkCommand.description,
//         bookmarkCommand.builder,
//         bookmarkCommand.handlerWrapper(bookmarkOptions)
//     )
//     .argv;
//     console.log(collectOptions);
//     console.log(bookmarkOptions);
// })();
// /****
//  * 次のコマンドは無効：
//  * $ node ./dist/index.js bookmark --bookmarkOver=1000 --tag="awesome" --author="TOTO" --toohot="toohotlady" collect --username="ichi" --password="password" --keyword="Rika"
//  * 
//  * bookmarkのコマンドは正常に読み取ってくれるけど、collectは無視される
//  * 
//  * どうやら、
//  * 
//  * yargs().command().command()とすると、
//  * 二番目以降のcommand()にはCLIのコマンド引数が渡されないみたい
//  * 
//  * あとコマンド長くなりすぎだから短く済むようにしたいなぁ
//  * 
//  * collect: キーワード検索、ブックマークから検索
//  * $ node index.js collect byKeyword [options]
//  * $ node index.js collect fromBookmark [options]
//  * 
//  * 
//  * */ 
