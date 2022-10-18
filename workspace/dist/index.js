"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs/yargs"));
//  Yargs(process.argv.splice(2)).command(
//     "makesure", "make sure what parameter handler will get",
//     {
//         awesome: {
//             describe: "awesome option",
//             type: "string",
//             demand: true
//         },
//         hoge: {
//             describe: "hoge", type: "number", demand: false
//         }
//     },
//     /*
//     型推論によると、
//     args: yargs.ArgumentsCamelCase<yargs.InferredOptionTypes<BUILDERのオブジェクト>>
//     */ 
//     (args) => {
//         // { _: [ 'makesure' ], awesome: 'AWESOME', '$0': 'dist/index.js' }
//         console.log(args);
//     }
//  ).argv;
{
    ;
    const bookmarkCommandBuilder = {
        bookmarkOver: {
            describe: "Specify artwork number of Bookmark",
            demandOption: false,
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
    // let bookmarkCommandValues = {} as iBookmarkOptions;
    let bookmarkCommandValues = {};
    // handlerの引数argsについて
    // 型推論によると
    // args: yargs.ArgumentsCamelCase<yargs.InferredOptionTypes<BUILDERのオブジェクト>>
    // Tは`extends {[key: string]: yargs.Options}`の制約を満たさなくてはならない
    const bookmarkCommandHandler = (args) => {
        console.log("handler");
        console.log(args);
        // retrieves option value into another object.
        Object.keys(args).forEach(key => {
            bookmarkCommandValues[key] = args[key];
        });
    };
    (0, yargs_1.default)(process.argv.splice(2))
        .command("bookmark", "Specified, bookmark artwork if it fulfills specific requirement.", bookmarkCommandBuilder, bookmarkCommandHandler).argv;
    console.log(bookmarkCommandValues);
}
/*
RESULT:

$ node ./dist/index.js bookmark --bookmarkOver=1000 --tag="awesome" --author="Kshinov"
{
  _: [ 'bookmark' ],
  bookmarkOver: 1000,
  'bookmark-over': 1000,
  tag: 'awesome',
  author: 'Kshinov',
  '$0': 'dist/index.js'
}

$

誤ったコマンドなら、handlerは空のオブジェクトを取得する
誤ったオプションを渡しても正常に動作する...
*/ 
