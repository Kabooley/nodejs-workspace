"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/************************************************************
 *
 * 結局yargsを使うには型情報を自前で用意するしかない。
 * ばーか
 * **********************************************************/
const index_1 = require("./commandModules/index");
console.log("result:");
console.log(index_1.commands.argv);
console.log(index_1.commands.collectOptions);
console.log(index_1.commands.bookmarkOptions);
