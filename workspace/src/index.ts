// /***********************************************
//  * NEW COMMAND: "bookmark"
//  * 
//  * LIKE THIS.
//  * ```bash
//  * $ node index.ts bookmark \
//  *  --amountOfBookmarkOver=5000 \
//  *  --tag=COWBOYBEBOP \
//  *  --author=awesomeCreator \
//  * ```
//  * 
//  * TODO:
//  * .commandならオプションのコマンドなのか？
//  * .demancCommandなら必須コマンドなのか？
//  * 
//  * *********************************************/ 
 import type yargs from 'yargs';
 import Yargs from 'yargs/yargs';

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
    interface iBookmarkOptions {
        bookmarkOver?: number;
        tag?: string;
        author?: string;
    };
    type iCommandBuild<T> = {
        [Property in keyof T]: yargs.Options;
    };
    
    const bookmarkCommandBuilder: iCommandBuild<iBookmarkOptions> = {
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
    let bookmarkCommandValues = {} as {[key: string]: any};

    // handlerの引数argsについて
    // 型推論によると
    // args: yargs.ArgumentsCamelCase<yargs.InferredOptionTypes<BUILDERのオブジェクト>>
    // Tは`extends {[key: string]: yargs.Options}`の制約を満たさなくてはならない
    const bookmarkCommandHandler = <T extends {[key: string]: yargs.Options}>(args: yargs.ArgumentsCamelCase<yargs.InferredOptionTypes<T>>): void => {
        
        console.log("handler");
        console.log(args);
        
        // retrieves option value into another object.
        Object.keys(args).forEach(key=> {
            bookmarkCommandValues[key] = args[key]
        })
    }

    Yargs(process.argv.splice(2))
    .command<iCommandBuild<iBookmarkOptions>>(
        "bookmark",
        "Specified, bookmark artwork if it fulfills specific requirement.",
        bookmarkCommandBuilder,
        bookmarkCommandHandler
    ).argv;

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

今のところhandlerの引数argsと全く同じオブジェクトを生成しているだけ。

つまりhandlerのargsはiCommandBuild<iBookmarkOptions>に_と$0が追加されたオブジェクトを受け取っている

interface iBookmarkOptionsのプロパティだけを取り出すように変更すること。

2. builderのtypeは型判定をしてくれるのか？

stringじゃなくてnumberを、stringを期待するオプションに渡してみる`--author=2222`
$ node ./dist/index.js bookmark --bookmarkOver=1000 --tag="awesome" --author=2222
{
  _: [ 'bookmark' ],
  bookmarkOver: 1000,
  'bookmark-over': 1000,
  tag: 'awesome',
  author: '2222',       // 何を入力しても文字列として認識されるだけ
  '$0': 'dist/index.js'

// booleanを渡してみる
$ node ./dist/index.js bookmark --bookmarkOver=1000 --tag="awesome" --author=false
handler
{
  _: [ 'bookmark' ],
  bookmarkOver: 1000,
  'bookmark-over': 1000,
  tag: 'awesome',
  author: 'false',  // 何を入力しても文字列として認識されるだけ
  '$0': 'dist/index.js'
}
誤ったコマンドなら、handlerというかたぶん.command()自体動作しない。

しかし、誤ったオプションを渡しても正常に動作する...

もうめんどくさいし今のところ必要ないからオプションが無効でも続行する
*/  