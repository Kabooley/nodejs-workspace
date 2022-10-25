/***
 * TODO: 公式の説明を最初からちゃんと読もう。
 * 
 * - マルチコマンドを受け付けるようにする
 * - そのコマンドに必須なオプションがなかったらエラーにする
 * - コマンド必須のときにコマンドがなかったらエラーにする
 * - helpとかは今はいらない
 * 
 * */ 
// import { bookmarkCommand } from './bookmarkCommand';
// import type { iBookmarkOptions } from './bookmarkCommand';
// import { collectCommand } from './collectCommand';
// import type { iCollectOptions } from './collectCommand';
import yargs from 'yargs/yargs';

yargs(process.argv.slice(2)).command('get <source> [proxy]', 'make a get HTTP request', (yargs) => {
    yargs.positional('source', {
      describe: 'URL to fetch content from',
      type: 'string',
      default: 'http://www.google.com'
    }).positional('proxy', {
      describe: 'optional proxy URL'
    })
  })
  .help()
  .argv

/**
 * .help()がどんな役割をするのか確認する
 * 
 * 必須コマンドとオプションはどうやったら実現できるのか
 * Advanced Topicsのサンプルから確認する
 * 
 * 
 * */ 

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