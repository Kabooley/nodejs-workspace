import type puppeteer from 'puppeteer';
import type { iSequentialAsyncTask } from '../utilities/TaskQueue';
import { search } from './search';
import { Navigation } from './Navigation';
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
    // 
    tasks.push(/* collect from result page parallel execution. */);
    tasks.push(/* collect from artwork page parallel execution. */)
    return tasks;
};