/*******************************************************
 * 検索結果ページ（正しくはそのページにアクセスしたときのHTTPResponse）からほしい情報を取得して収集する。
 * 
 * 前の処理段階で増加させるpageインスタンスが決められており、
 * ここではインスタンスどうし並列処理させて、
 * インスタンス毎逐次処理させる。
 * 
 * page: puppeteer.Pageインスタンス, 
 * pageInstances: pageインスタンスを格納している配列
 * sequence: 各pageの逐次処理taskQueue
 * concurrency: 並列処理同時実行数上限
 * 
 * 
 * 外部でこのモジュールが呼び出されるとして、
 * 前提とする変数をすべて引き取らなくてはいけないはず...
 * (検索結果ページがなんページなのかとか)
 * 
 * *****************************************************/ 
import type puppeteer from 'puppeteer';

const setupTasks = (
    numberOfProcess: number,    // 作成するpageインスタンスの数
    numberOfPages: number       // 検索結果ページがなんページなのか
    ) => {
    let concurrency: number = numberOfProcess;
    const pageInstances: puppeteer.Page[] = [];
    const sequences: Promise<void>[] = [];


}