import yargs from 'yargs/yargs';
// import type { Arguments, Argv, CommandModule, InferredOptionTypes, Options, PositionalOptions } from 'yargs'
import type { Argv } from 'yargs'
import { bookmarkCommand, iBookmarkOptions } from './bookmarkCommand';
import { collectCommand, iCollectOptions } from './collectCommand';


// let isCorrect: boolean = false;
const bookmarkOptions = {} as iBookmarkOptions; 
const collectOptions = {} as iCollectOptions;

// // Check commands are correct.
// const checkCommands = (
//         yargs: Argv, argv: Arguments, 
//         demandCommandNumbers: number, demandCommands: string[]
//     ) => {
//     // check commands and modify isCorrect.
//     if(argv._.length < demandCommandNumbers) {
//         // Cancel running application and show help
//         yargs.showHelp();
//     }
//     // NOTE: ここでやっていることこそが必須コマンドを検査する部分
//     let isMatched: boolean = false;
//     for(const c of demandCommands) {
//         isMatched = (c.localeCompare(argv._.join()) === 0) || isMatched;
//     };
//     if(isMatched) {
//         // It is valid command
//     }
//     else {
//         // Cancel running application and show help
//         yargs.showHelp();
//     }
// }

// bookmarkのほうは期待通りに動くけど、
// collectのほうはなぜかhandlerが機能しない
// たぶんcommandのbuilderのなかでcommand呼び出すと
// そのネストしたcommandのなかでのハンドラが選択されて
// ネストしたcommandをラップしているcommandのハンドラは
// つかわれないのである。
// 
// なのでマルチコマンドのハンドラはネストされたほうのcommandのハンドラで定義すること
// 
// また、
// 今回はcollectに関してはマルチコマンド必須だから
// collectのほうのハンドラが実行されるときは間違ったコマンドをうっているときなので
// そのためのハンドラとして定義するといいかも
export const input = yargs(process.argv.splice(2))
    .command(
        collectCommand.command,
        collectCommand.description,
        (yargs: Argv) => {
            // const collectArgv = yargs
            //     .command(
            //         "byKeyword", "",
            //         collectCommand.builder
            //     )
            //     .command(
            //         "fromBookmark", "",
            //         collectCommand.builder
            //     )
            //     .help('help')
            //     .wrap(null)
            //     .argv;
                // checkCommands(
                //     yargs, collectArgv, 2, 
                //     [collectCommand.command + "byKeyword", collectCommand.command + "fromBookmark"]
                // );
                return yargs
                .command(
                    "byKeyword", "",
                    collectCommand.builder
                )
                .command(
                    "fromBookmark", "",
                    collectCommand.builder
                )
                .help('help')
                // .wrap(null).argv;
        },
        // (a) => {
        //     if(isCorrect) {
        //         // handle when collect commands are good
        //         return collectCommand.handlerWrapper(collectOptions)(a);
        //     }
        //     else {

        //     }
        // }
        collectCommand.handlerWrapper(collectOptions)
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