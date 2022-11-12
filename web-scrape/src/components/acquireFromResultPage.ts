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
import { Collect } from './Collect';
import { Navigation} from './Navigation';
import type { iIllustMangaDataElement, iIllustManga, iBodyIncludesIllustManga } from '../constants/illustManga';

// 検索結果の各artworkのidを格納する
let collectedIds: string[] = [];
const collector: Collect = new Collect<iIllustMangaDataElement>();
const navigatoin: Navigation = new Navigation();
const filterUrl: string = "";


/****
 * 検索結果ページ遷移時に取得できるHTTPResponseのjsonデータをobjectで引数として取得する
 * 必要な情報を取り出して収集用の配列へpushする
 * 
 * 
 * */ 
const executor = (data: iBodyIncludesIllustManga, key: string) => {
    // retrieve data
    const retrievedData: iIllustMangaDataElement[] = retrieveProcess();
    collector.resetData(retrievedData);
    // contains ids to collectedIds
    collectedIds = [...collectedIds, ...collector.execute(key)];
}

const setupTasks = async (
    browser: puppeteer.Browser,
    numberOfProcess: number,    // 作成するpageインスタンスの数
    numberOfPages: number,       // 検索結果ページがなんページなのか
    ) => {
    let concurrency: number = numberOfProcess;
    const pageInstances: puppeteer.Page[] = [];
    const sequences: Promise<void>[] = [];
    let currentPage: number = 1;
    const navigation: Navigation = new Navigation();

    for(let i = 0; i < concurrency; i++) {
        pageInstances.push(await browser.newPage());
        sequences.push(Promise.resolve());
    }
    // NOTE: iは検索結果ページのページ番号と同じになる
    for(let i = 1; i < numberOfPages; i++) {
        const circulator: number = i % concurrency;
        sequences[circulator] = sequences[circulator]?
        .then(() => {   // 引数はいらないはず
            navigation.resetFilter((res: puppeteer.HTTPResponse) => 
                // TODO: filterUrl = "https:....?p=${i}"となるURLにすること
                res.status() === 200 && res.url() === filterUrl
            );
            
            // i番目のページへアクセスする(Navigationはひとつでいいのか？sequence毎でいいのか？)
            const responces: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(pageInstances[circulator]!, pageInstances[circulator]!.goto(filterUrl));

            // filterUrlに対するHTTPResponseを取得する
            const requiredResponse: puppeteer.HTTPResponse = responces.shift();
            // HTTPResponseからデータを取得する
            // データを取り出す
            // データからほしい情報をollectedへ格納する
        })
    }

    // TODO: finallyで必ず新規作成したpageインスタンスをcloseすること



}

/*****************************
 * 検索結果レスポンスからヒット数が何件あるのか判明する: totalPage
 * 
 * 並列処理数がヒット数から決まる: numberOfProcess
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * */ 