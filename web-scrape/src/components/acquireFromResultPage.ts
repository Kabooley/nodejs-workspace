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
import { retrieveDeepProp } from '../utilities/objectModifier';

// 検索結果の各artworkのidを格納する
let collectedIds: string[] = [];
const collector: Collect<iIllustMangaDataElement> = new Collect<iIllustMangaDataElement>();
const filterUrl: string = "";



/*******
 * TODO: taskを組み立てるだけ
 * 実行はしない
 * 
 * というようにしたい
 * 
 * TODO: finallyを組み込んでここで生成したpageインスタンスを必ずcloseする
 * 
 * 
 * */ 
const setupTasks = (
    browser: puppeteer.Browser,
    numberOfProcess: number,    // 作成するpageインスタンスの数
    numberOfPages: number,       // 検索結果ページがなんページなのか
    ): Promise<void>[] => {
    let concurrency: number = numberOfProcess;
    const pageInstances: puppeteer.Page[] = [];
    const sequences: Promise<void>[] = [];
    const navigation: Navigation = new Navigation();

    for(let i = 0; i < concurrency; i++) {
        pageInstances.push(await browser.newPage());
        sequences.push(Promise.resolve());
    }
    // NOTE: iは検索結果ページのページ番号と同じになる
    for(let currentPage = 1; currentPage < numberOfPages; currentPage++) {
        const circulator: number = currentPage % concurrency;
        if(sequences[circulator] !== undefined) {
            sequences[circulator] = sequences[circulator]!
            .then(() => {
                navigation.resetFilter((res: puppeteer.HTTPResponse) => 
                    // TODO: filterUrl = "https:....?p=${i}"となるURLにすること
                    res.status() === 200 && res.url() === filterUrl
                );
                
                // TODO: awaitのエラーはthne()のハンドラ関数がasyncじゃないから
                // あとで分離するので一旦awaitのままで

                // i番目のページへアクセスする(Navigationはひとつでいいのか？sequence毎でいいのか？)
                const responces: (puppeteer.HTTPResponse | any)[] = await navigation.navigateBy(pageInstances[circulator]!, pageInstances[circulator]!.goto(filterUrl));
    
                // filterUrlに対するHTTPResponseを取得する
                // HTTPResponseからデータを取得する
                const illustMangaDataElements: iIllustMangaDataElement[] = retrieveDeepProp<iIllustMangaDataElement[]>(["body", "illustManga", "data"], (await responces.shift().json()) as iBodyIncludesIllustManga); 
                // データからほしい情報をollectedへ格納する
                collector.resetData(illustMangaDataElements);
                collectedIds = [...collectedIds, ...collector.execute("id")];
            });
        }
        else {
            console.error("RangeError: Accessing out range of array.");
        }
    }

    return sequences;

    // finallyで必ず新規作成したpageインスタンスをcloseすること
    // となるとclassにしたほうがいいかも
};