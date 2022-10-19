"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/***
 * そのコマンドに必須なオプションがなかったらエラーにする
 * コマンド必須のときにコマンドがなかったらエラーにする
 *
 *
 * */
const bookmarkCommand_1 = require("./bookmarkCommand");
const collectCommand_1 = require("./collectCommand");
const yargs_1 = __importDefault(require("yargs/yargs"));
(function () {
    const bookmarkOptions = {};
    const collectOptions = {};
    (0, yargs_1.default)(process.argv.splice(2))
        .command(collectCommand_1.collectCommand.command, collectCommand_1.collectCommand.description, collectCommand_1.collectCommand.builder, collectCommand_1.collectCommand.handlerWrapper(collectOptions))
        .command(bookmarkCommand_1.bookmarkCommand.command, bookmarkCommand_1.bookmarkCommand.description, bookmarkCommand_1.bookmarkCommand.builder, bookmarkCommand_1.bookmarkCommand.handlerWrapper(bookmarkOptions))
        .argv;
    console.log(collectOptions);
    console.log(bookmarkOptions);
})();
/****
 * 次のコマンドは無効：
 * $ node ./dist/index.js bookmark --bookmarkOver=1000 --tag="awesome" --author="TOTO" --toohot="toohotlady" collect --username="ichi" --password="password" --keyword="Rika"
 *
 * bookmarkのコマンドは正常に読み取ってくれるけど、collectは無視される
 *
 *
 * あとコマンド長くなりすぎだから短く済むようにしたいなぁ
 *
 * collect: キーワード検索、ブックマークから検索
 * $ node index.js collect byKeyword [options]
 * $ node index.js collect fromBookmark [options]
 *
 *
 * */ 
