import yargs from 'yargs/yargs';
import { Argv, string } from 'yargs'
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
const checkCommands = (y: Argv, a: Exclude<iArguments, iArgumentsPromise>, requiredNumber: number) => {

    // _ includes commands.
    const { _ } = a;

    // Insufficient number of arguments
    if(_.length < requiredNumber) {
        console.log("Subcommand is missing. 'collect' command expects 1 more subcommand.");
        y.showHelp();
        // throw new Error();
    }
    // Excessive number of arguments
    if(_.length > requiredNumber) {
        console.log("Too much subcommands. 'collect' command expects only 1 additional subcommand.");
        y.showHelp();
        // throw new Error();
    }

    // CHECK EVERY SUBCOMMANDS ARE INCLUDED.
    // すべての期待されるサブコマンドが含まれてしまっていないか検査する
    // NOTE: この検査機能は本当はいらない。すでにコマンド引数の数ではじいているから。
    // 
    // TODO: test this.
    if(expectedSubCommands.every(e => _.includes(e))) {
        console.log("Wrong command. Choose one of 'collect byKeyword' or 'collect fromBookmark'.");
        // throw new Error();
    };
    // Check if at least one of expectedSubCommands is includes in command.
    if(expectedSubCommands.some(e => _.includes(e))) {
        // 
        // TODO: handlerで、このファイルの下部に書いてあるorderを生成させるようにする
        // 
        collectCommand.handlerWrapper(collectOptions)(a);

    }
    else {
        console.log("Commands not include expected subcommand.");
        y.showHelp();
        // throw new Error();
    }
};

const input = yargs(process.argv.splice(2))
    .command(
        collectCommand.command,
        collectCommand.description,
        (yargs: Argv) => {
                const subcommands = yargs
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

                checkCommands(yargs, subcommands, 2);
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
// 次をexportするようにしたい
// export const order = {
//     command: string,
//     subcommand: string,
//     options: {
//         // ...
//     }
// }