import yargs from 'yargs/yargs';
import type { Argv } from 'yargs'
import { bookmarkCommand, iBookmarkOptions } from './commandModules/bookmarkCommand';
import { collectCommand, iCollectOptions } from './commandModules/collectCommand';

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

/****
 * Handles and check `collect <byKeyword|fromBookmark>` commands are valid.
 * 
 * `collect`と`collect byKeyword`と`collect bookmark`のすべての
 * コマンドの入力検査とハンドリングを担う。
 * */ 
const checkCommands = (a: Exclude<iArguments, iArgumentsPromise>, requiredNumber: number) => {
    console.log("CHECK COMMANDS");
    // コマンド引数が足りない
    if(a._.length < requiredNumber) {
        console.log("'collect' command expects at least 1 more parameter.");
        // throw new Error();
    }
    // 関係ないコマンドを入力していないか
    if(!a._.includes("byKeyword") && !a._.includes("fromBookmark")){
        console.log("You input unnecessary command following 'collect'.");
        // throw new Error();
    }
    // byKeywordもfromBookmarkも両方入れられている
    // これはむしろ数ではじいた方がいいかも
    if(a._.includes("byKeyword") && a._.includes("fromBookmark")) {
        console.log("Wrong command. Choose one of 'collect byKeyword' or 'collect fromBookmark'.");
        // throw new Error();
    }

    // handling each commands.

    if(a._.includes("byKeyword") && a._.length === 2) {
        // handler for 'collect byKeyword' command.
        // retrieve options into object.
        collectCommand.handlerWrapper(collectOptions)(a);
    }
    if(a._.includes("fromBookmark") && a._.length === 2) {
        // handler for 'collect fromBookmark' command.
        // retrieve options into object.
        collectCommand.handlerWrapper(collectOptions)(a);
    }
};

const input = yargs(process.argv.splice(2))
    .command(
        collectCommand.command,
        collectCommand.description,
        (yargs: Argv) => {
                const collectCommandOptions = yargs
                .command(
                    "byKeyword", "",
                    collectCommand.builder
                    // NOTE: DO NOT CALL handler here for works multi commands.
                )
                .command(
                    "fromBookmark", "",
                    collectCommand.builder
                    // NOTE: DO NOT CALL handler here for works multi commands.
                )
                .help('help')
                // NOTE: Promise<>の場合を取り除く
                // そうしないとcheckCommands()へ戻り値を渡すことができない。
                .wrap(null).argv as Exclude<iArguments, iArgumentsPromise>;

                checkCommands(collectCommandOptions, 2);
        }
        // NOTE: DO NOT CALL handler here for works multi commands.

    )
    .command(
        bookmarkCommand.command,
        bookmarkCommand.description,
        bookmarkCommand.builder,
        bookmarkCommand.handlerWrapper(bookmarkOptions)
    )
    .help()
    .wrap(null)
    .argv as Exclude<iArguments, iArgumentsPromise>;

export interface iCommands {
    argv: Exclude<iArguments, iArgumentsPromise>;
    collectOptions: iCollectOptions;
    bookmarkOptions: iBookmarkOptions;
};

export const commands: iCommands = {
    argv: input,
    collectOptions: collectOptions,
    bookmarkOptions: bookmarkOptions
}; 
// 
// 最終的にコマンドとそのオプションを確保できればよろしい
// アプリケーションにはどのコマンドなのか、どのオプションなのかがわかればいいので
// 上記のcommandsでなくていい（ここでは機能もりもりにしたくないのでこのままですが）