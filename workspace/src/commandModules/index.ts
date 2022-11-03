import yargs from 'yargs/yargs';
import type { Argv } from 'yargs'
import { bookmarkCommand, iBookmarkOptions } from './bookmarkCommand';
import { collectCommand, iCollectOptions } from './collectCommand';

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
const expectedSubCommands: string[] = ["byKeyword", "fromBookmark"];

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
    // CHECK SUBCOMMANDS ARE CORRECT.
    // 
    // TODO: 要改善：ハードコーディングを避ける
    // 関係ないコマンドを入力していないか
    // if(!a._.includes("byKeyword") && !a._.includes("fromBookmark")){
    //     console.log("You input unnecessary command following 'collect'.");
    //     // throw new Error();
    // }

    // sub commandは先の検査で入力数が正しいとする
    // a._[1]を比較対象とする
    let isSubcommandCorrect: boolean = false;
    for(const subcommand of expectedSubCommands) {

        // DEBUG:
        console.log(subcommand);
        console.log(a._[1]);
        console.log(isSubcommandCorrect);
        console.log(a._[1] === subcommand);

        // This operator will return true if one of operand is true. 
        isSubcommandCorrect = isSubcommandCorrect || a._[1] === subcommand;
    }


    if(!isSubcommandCorrect) {
        console.log("There is no expected subcommand.");
        console.log(`Expected subcommands for 'collect' are: ${expectedSubCommands.join(',')}`);
        // throw new Erorr();
    }

    // CHECK EVERY SUBCOMMANDS ARE INCLUDED.
    // 
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
    .argv;

export const commands = {
    argv: input,
    collectOptions: collectOptions,
    bookmarkOptions: bookmarkOptions
}; 