/*******************************************
 * `./commandParser/index.ts`で取得したデータを解釈するよ
 * 
 * *****************************************/ 
import { commands } from '../commandParser/index';
import type { iCommands } from '../commandParser/index';


/* 
よく考えたら、
commandParserの方で
コマンドとオプションだけ返すようにすればいいのでは？

以下を受け取って
const commands: iCommands = {
    argv: input,
    collectOptions: collectOptions, // 空のオブジェクトである可能性がある
    bookmarkOptions: bookmarkOptions // 空のオブジェクトである可能性がある
}; 

src/index.tsではどのコマンドでどのオプションなのかを解釈して
何を実行すればいいのかがわかるようにしておけばいい


*/