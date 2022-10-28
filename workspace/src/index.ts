/************************************************************
 * 
 * 結局yargsを使うには型情報を自前で用意するしかない。
 * ばーか
 * **********************************************************/ 
// import { bookmarkCommand } from './bookmarkCommand';
// import type { iBookmarkOptions } from './bookmarkCommand';
// import { collectCommand } from './collectCommand';
// import type { iCollectOptions } from './collectCommand';
import yargs, { Argv } from 'yargs';
import type Yargs from 'yargs/yargs';

type iArgv = {
  [x: string]: unknown;
  _: (string | number)[];
  $0: string;
};

// こいつをbuilder内部で呼び出すことで
// 入力されたコマンドの数などを検査できる
const checkCommand = (yargs: Argv, argv: iArgv | Promise<iArgv>, requiredNumber: number, requiredCommands: string[]) => {
  const {_} = argv;
  if(_.length < requiredNumber) {
    yargs.showHelp();
  }
  else {
    let c = "";
    for(const cmd of _) {   // 順番が重要なのでfor..ofを使うこと
      c = c + cmd;
    };
    // 完全一致検査: 完全一致で0を返す
    if(!requiredCommands.join().localeCompare(c)){
      // 正しいコマンドを入力した
      // 処理を続けてOK
    }
    else {
      // 誤ったコマンドを入力している
    }
  }
};

// TODO: check this out.
let argu = yargs(process.argv.splice(2))
.command(
  "collect", "collect something",
  (yargs) => {
    const collectArgv: iArgv = yargs
    .command(
      "byKeyword", "collect something by keyword",
      {
        // Login ID
        username: {
          describe: "username",
          demandOption: true,
          type: "string",
        },
        // Login Password
        password: {
          describe: "password",
          demandOption: true,
          type: "string",
        },
        // Search keyword
        keyword: {
          describe: "keyword",
          demandOption: false,
          type: "string",
        }
      }, 
      () => {}
    )
    .command(
      "fromBookmark", "collect something from bookmark",
      {
        // Login ID
        username: {
          describe: "username",
          demandOption: true,
          type: "string",
        },
        // Login Password
        password: {
          describe: "password",
          demandOption: true,
          type: "string",
        },
        // Search keyword
        keyword: {
          describe: "keyword",
          demandOption: false,
          type: "string",
        }
      }, 
      () => {}
    )
    .help('help')
    .wrap(null)
    .argv;
    checkCommand(yargs, collectArgv, 2);
  },
  (a) => {
    console.log("handler a");
    console.log(a);
  }
)
.command(
  "bookmarkIt", "bookmark something",
  {
    bookmarkOver: {
        describe: "Specify artwork number of Bookmark",
        demandOption: true,
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
  }, 
  (a) => {
    console.log("handler b");
    console.log(a);
  }
)
.help().argv;

checkCommand(yargs, argu, 1);


console.log(argu);

// (function() {
//     const bookmarkOptions = {} as iBookmarkOptions; 
//     const collectOptions = {} as iCollectOptions; 
//     Yargs(process.argv.slice(2))
//     .command(
//         collectCommand.command,
//         collectCommand.description,
//         collectCommand.builder,
//         collectCommand.handlerWrapper(collectOptions),
//     )
//     .command(
//         bookmarkCommand.command,
//         bookmarkCommand.description,
//         bookmarkCommand.builder,
//         bookmarkCommand.handlerWrapper(bookmarkOptions)
//     )
//     .argv;
//     console.log(collectOptions);
//     console.log(bookmarkOptions);
// })();

// /****
//  * 次のコマンドは無効：
//  * $ node ./dist/index.js bookmark --bookmarkOver=1000 --tag="awesome" --author="TOTO" --toohot="toohotlady" collect --username="ichi" --password="password" --keyword="Rika"
//  * 
//  * bookmarkのコマンドは正常に読み取ってくれるけど、collectは無視される
//  * 
//  * どうやら、
//  * 
//  * yargs().command().command()とすると、
//  * 二番目以降のcommand()にはCLIのコマンド引数が渡されないみたい
//  * 
//  * あとコマンド長くなりすぎだから短く済むようにしたいなぁ
//  * 
//  * collect: キーワード検索、ブックマークから検索
//  * $ node index.js collect byKeyword [options]
//  * $ node index.js collect fromBookmark [options]
//  * 
//  * 
//  * */ 