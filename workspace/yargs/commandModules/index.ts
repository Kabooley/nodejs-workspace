/************************************************************
 * Parse entered commands into cli and check them.
 * If correct return as command and option object.
 * 
 * TODO: Implement error handling.
 * TODO: Implement command interpreter and introduce themn to entire app.
 * **********************************************************/ 
import yargs from 'yargs/yargs';
import { Argv } from 'yargs'
import { bookmarkCommand } from './bookmarkCommand';
import { collectCommand } from './collectCommand';

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

// Contains options.
const options = {};

// NOTE: Commands array below must be modified if you add or remove.
const demandCommands: string[] = ["collect", "bookmark"];
const expectedSubCommands: string[] = ["byKeyword", "fromBookmark"];


/****
 * Check demand command is correctly 
 * 
 * */ 
const checkDemandCommands = (a: Exclude<iArguments, iArgumentsPromise>): void => {
    const { _ } = a;

    if(!demandCommands.some(e => _.includes(e))) {
        console.log("There is no demand command.");
        // throw new Error();
    }
};

/****
 * Handles and check `collect <byKeyword|fromBookmark>` commands are valid.
 * 
 * `collect`と`collect byKeyword`と`collect bookmark`のすべての
 * コマンドの入力検査とハンドリングを担う。
 * 
 * */ 
const checkCollectCommands = (y: Argv, a: Exclude<iArguments, iArgumentsPromise>, requiredNumber: number): void => {

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

    // Check if at least one of expectedSubCommands is includes in command.
    // 
    // If process passes to here, then commands are correct.
    if(expectedSubCommands.some(e => _.includes(e))) {
        // 
        // TODO: handlerで、このファイルの下部に書いてあるorderを生成させるようにする
        // 
        // collectCommand.handlerWrapper(collectOptions)(a);
        collectCommand.handlerWrapper(options)(a);

    }
    else {
        console.log("Commands not include expected subcommand.");
        y.showHelp();
        // throw new Error();
    }
};

const order = yargs(process.argv.splice(2))
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
                // そうしないとcheckCollectCommands()へ戻り値を渡すことができない。
                .wrap(null).argv as Exclude<iArguments, iArgumentsPromise>;

                checkCollectCommands(yargs, subcommands, 2);
        }
        // NOTE: DO NOT CALL handler here for works multi commands.

    )
    .command(
        bookmarkCommand.command,
        bookmarkCommand.description,
        bookmarkCommand.builder,
        bookmarkCommand.handlerWrapper(options)
    )
    .help()
    .wrap(null)
    .argv as Exclude<iArguments, iArgumentsPromise>;

checkDemandCommands(order);

export const orders = {
    // commands includes subcommand.
    commands: order._,
    options: options
};