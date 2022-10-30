import yargs from 'yargs/yargs';
import type { Argv } from 'yargs'
import { bookmarkCommand, iBookmarkOptions } from './bookmarkCommand';
import { collectCommand, iCollectOptions } from './collectCommand';

// TODO: 実行結果の記録とこのコードのノートとつかい方の説明

// yargs()が返すオブジェクト
type iArguments =  {
    [x: string]: unknown;
    _: (string | number)[];
    $0: string;
} | Promise<{
    [x: string]: unknown;
    _: (string | number)[];
    $0: string;
}>;

// yargs()が返すオブジェクトのtupleのうちのPromise部分
type iArgumentsPromise = Promise<{
    [x: string]: unknown;
    _: (string | number)[];
    $0: string;
}>;


// let isCorrect: boolean = false;
const bookmarkOptions = {} as iBookmarkOptions; 
const collectOptions = {} as iCollectOptions;

// どうやらyargsが返すオブジェクトを型付けすると
// 以下のように`Yargs.ArgumentsCamelCase<{}>`となるみたい
// const checkCommands = (a: Yargs.ArgumentsCamelCase<{}>, requiredNumber: number) => {
const checkCommands = (a: Exclude<iArguments, iArgumentsPromise>, requiredNumber: number) => {
    if(a._.length < requiredNumber) {
        console.log("'collect' command expects at least 1 more parameter.");
    }
    if(!a._.includes("byKeyword") || !a._.includes("byKeyword")) {
        console.log("Wrong command.");
    }
};

export const input = yargs(process.argv.splice(2))
    .command(
        collectCommand.command,
        collectCommand.description,
        (yargs: Argv) => {
                const collectCommandOptions = yargs
                .command(
                    "byKeyword", "",
                    collectCommand.builder,
                    collectCommand.handlerWrapper(collectOptions)
                )
                .command(
                    "fromBookmark", "",
                    collectCommand.builder,
                    collectCommand.handlerWrapper(collectOptions)
                )
                .help('help')
                // Promise<>の場合を取り除く
                // そうしないとcheckCommands()へ戻り値を渡すことができない。
                .wrap(null).argv as Exclude<iArguments, iArgumentsPromise>;

                // この関数は
                // 上記の"byKeyword"や"fromBookmark"のハンドラよりも
                // 先に呼び出される
                // なのでコマンドのチェックとかするのにちょうどいいかも
                checkCommands(collectCommandOptions, 2);
        },
        // 
        // ここのハンドラは"collect byKeyword"または"collect fromBookmark"以外のコマンドを
        // collectに続けて（またはcollect単体で）入力したときに実行される
        // なので
        // 'collect'はコマンドを続けて入力するのを必須としたいような場合に
        // ここでコマンドを検査するようにするとよい
        (a) => {
            if(a._.length < 2) {
                console.log("'collect' command expects at least 1 more parameter.");
            }
            // 少なくともbyKeywordまたはfromBookmarkが含まれているかどうかのチェック
        }
    )
    .command(
        bookmarkCommand.command,
        bookmarkCommand.description,
        bookmarkCommand.builder,
        bookmarkCommand.handlerWrapper(bookmarkOptions)
    )
    .help()
    .wrap(null)
    .argv;