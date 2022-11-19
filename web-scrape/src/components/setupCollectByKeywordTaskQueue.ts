/******************************************************************
 * `collect byKeyword` command task genearation.
 * 
 * `collect byKeyword` commandに基づく一連の処理を逐次処理として組み立てる。
 * 
 * Promiseチェーンからなる逐次処理に、
 * あらかじめ定められているタスクを追加していく。
 * 逐次処理のPromiseチェーンが組み立てられたらそのPromiseを返す。
 * 
 * task:
 * - fill search form by keyword
 * - navigate to keyword search result page
 * - get its http response
 * - parse its http response
 * - generate collecting process
 * - return collected data
 * 
 * `collect byKeyword`のオプション：
 * - keyword: string - 検索キーワード
 * - tas: string - 検索結果作品のタグ群に含まれていてほしいタグ
 * - author: string - 
 * ****************************************************************/ 
import type puppeteer from 'puppeteer';
import type { iSequentialAsyncTask } from '../utilities/TaskQueue';
import { search } from './search';
import { Navigation } from './Navigation';
import { AssembleParallelPageSequences } from './AssembleParallelPageSequences';
import type { iIllustMangaDataElement, iIllustManga, iBodyIncludesIllustManga } from '../constants/illustManga';


let tasks: iSequentialAsyncTask[] = [];
// TODO: define url.
const url = "";

export const setupCollectByKeywordTaskQueue = (
    page: puppeteer.Page, 
    options: {[x: string]: unknown}     // 型をはっきりと指定できないかなぁ...
    ) => {
    const { keyword, tag, author } = options;

    // prepare for setting up
    const escapedKeyword: string = encodeURIComponent(keyword as string); 
    let lastPage: number = 1;

    // setting up task queue.
    // 
    // 1. fill search form with keyword.
    tasks.push(() => search(page, keyword as string));
    // TODO: NavigationのwaitFoHTTPResponseのセットアップ
    // 2. page navigation.
    tasks.push(() => {
        const navigation = new Navigation();
        navigation.resetFilter((res: puppeteer.HTTPResponse) => 
            res.status() === 200 && res.url() === url
        );
        return navigation.navigateBy(page, page.keyboard.press('Enter'))
    });
    // 3. Check the response includes required data.
    tasks.push((res: (puppeteer.HTTPResponse | any)[]) => {
        const response: puppeteer.HTTPResponse = res.shift();
        return response.json()
            .catch(err => {
                // error handling for response.json()
            });
    });
    // 4. Define numberOfProcess according to number of result. 
    tasks.push((illustManga: iIllustManga) => {
        const { data, total } = illustManga;
        lastPage = Math.floor(total / data.length);
        let numberOfProcess: number = 1;

        if(lastPage >= 20 && lastPage < 50) {
            numberOfProcess = 2;
        }
        else if(lastPage >= 50 && lastPage < 100) {
            numberOfProcess = 5;	
        }
        else if(lastPage >= 100) {
            numberOfProcess = 10;
        }
        else {
            numberOfProcess = 1;
        };
        return numberOfProcess;
    });
    // 5. setup parallel sequences
    tasks.push(
        // TODO: assembleParallelPageSequencesの組み立て
    );
    tasks.push(
        // TODO: assembleParallelPageSequencesで組み立てた逐次処理群の並列処理実行
        // データの取得
    )
    return tasks;
};