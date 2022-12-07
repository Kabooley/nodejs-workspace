/****************************************************
 * Action class
 * 
 * CLIで指定された動作を実行するための関数を返すためのクラス
 * sequences[circulator] = sequences[circulator]
 * .then(() => navigation())
 * .then((res) => resolveResponsesToSpecificData(res))
 * .then((data) => doAction(data))  <-- here.
 * .then(() => /.../)
 * 
 * 逐次処理に含めることを前提とするので
 * Promiseを返すこと
 * 逐次処理の段階で前回のPromiseから引数をとらないこと
 * 
 * 
 * 取得する可能性のあるCLIコマンドとオプションの組み合わせ
 * - `collect byKeyword --keyword --tags --bookmarkOver --userName`
 * とくになし
 * - `collect fromBookmark --keyword --tags --bookmarkOver --userName`
 * とくになし
 * - `bookmark --keyword --tags --bookmarkOver --userName`
 * そのartworkをブックマークする操作
 * - `download byKeyword --keyword --tags --bookmarkOver --userName`
 * - `download fromBookmark --keyword --tags --bookmarkOver --userName`
 * ダウンロードする
 * 
 * 実行する内容は
 * *************************************************/ 
// import type puppeteer from 'puppeteer';

// const action = (order: string): void => {
//     switch(order) {
//         case "collect": 
//         break;
//         case "bookmark": 
//         break;
//         case "download": 
//         break;
//         default:
//         break;
//     }
// };

// /**
//  * @param {puppeteer.Page} page - 
//  * 
//  * */ 
// const bookmark = (page: puppeteer.Page): Promise<void> => {
//     // TODO: Check if it is already bookmarked.
//     return page.click(
//             // TODO: specify selector of bookmark button
//         ).then(() => resolve()).catch(e => reject(e));
// };

// /**
//  * Dispatches download order witch url.
//  * 
//  * */ 
// const download = (url: string): Promise<void> => {
//     // TODO: Implement download process
// }