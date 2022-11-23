/************************************************************
 * Parse entered commands into cli and check them.
 * If correct return as command and option object.
 * 
 * NOTE: yargs is not able to handle multi commands.
 * **********************************************************/ 
 import yargs from 'yargs/yargs';
 import type { Argv } from 'yargs'
 import type { iBookmarkOptions } from './commandModules/bookmarkCommand';
 import { bookmarkCommand } from './commandModules/bookmarkCommand';
 import type { iCollectOptions } from './commandModules/collectCommand';
 import { collectCommand } from './commandModules/collectCommand';
 
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
 const options = {} as iOptions;
 
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
         throw new Error("Error: Command you input was includes not expected commands.");
     }
 };
 
 const order = yargs(process.argv.splice(2))
     .command(
         collectCommand.command,
         collectCommand.description,
         (yargs: Argv) => {
                 const subcommands = yargs
                 .command(
                     "byKeyword", "Descriotion of byKeyword.",
                     collectCommand.builder
                     // NOTE: DO NOT CALL handler here for works multi commands.
                 )
                 .command(
                     "fromBookmark", "Description of fromBookmark",
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

 interface iOptions extends iCollectOptions, iBookmarkOptions {};

 export interface iOrders {
    commands: (string | number)[];
    options: iOptions;
 };
 

 export const orders: iOrders = {
     // commands includes subcommand.
     commands: order._,
     options: options
 };


// --- UAGE ---

// -- LEGACY ---
// 
//  export interface iOrders {
//     commands: (string | number)[];
//     options: {
//         [x: string]: unknown
//     };
//  };
 