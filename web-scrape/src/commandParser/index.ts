/************************************************************
 * 
 * 結局yargsを使うには型情報を自前で用意するしかない。
 * ばーか
 * **********************************************************/ 
import { commands } from './commandModules/index';

console.log("result:");
console.log(commands.argv);
console.log(commands.collectOptions);
console.log(commands.bookmarkOptions);