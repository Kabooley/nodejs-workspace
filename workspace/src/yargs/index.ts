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

const bookmarkOptions = {} as iBookmarkOptions; 
const collectOptions = {} as iCollectOptions;

const checkCommands = (a: Exclude<iArguments, iArgumentsPromise>, requiredNumber: number) => {
    if(a._.length < requiredNumber) {
        console.log("'collect' command expects at least 1 more parameter.");
    }
    if(a._.includes("byKeyword") && a._.includes("fromBookmark")) {
        console.log("Wrong command. Choose one of 'collect byKeyword' or 'collect fromBookmark'.");
    }
    if(a._.includes("byKeyword") && a._.length === 2) {
        // handler for 'collect byKeyword' command.
    }
    if(a._.includes("fromBookmark") && a._.length === 2) {
        // handler for 'collect fromBookmark' command.
    }
    // TODO: 'collect bookmark'の場合もここでチェックすべきか、'collect'のハンドラに任せるべきか検証
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
                // NOTE: Promise<>の場合を取り除く
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
        // 
        // 今のところこのhandlerが実行されるとき、checkCommands()も実行される
        (a) => {
            if(a._.length < 2) {
                console.log("'collect' command expects at least 1 more parameter.");
            }
            if(a._.includes('bookmark')) {
                console.log("Wrong command. 'bookmark' command cannot be used with 'collect'.");
            }
        }
    )
    .command(
        bookmarkCommand.command,
        bookmarkCommand.description,
        bookmarkCommand.builder,
        // TODO: 'bookmark collect'というコマンドに対処できているか検証
        bookmarkCommand.handlerWrapper(bookmarkOptions)
    )
    .help()
    .wrap(null)
    .argv;