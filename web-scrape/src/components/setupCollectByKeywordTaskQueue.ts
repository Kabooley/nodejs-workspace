import type puppeteer from 'puppeteer';
import type { iSequentialAsyncTask } from '../utilities/TaskQueue';
import { search } from './search';
import { Navigation } from './Navigation';

let tasks: iSequentialAsyncTask[] = [];

export const setupCollectByKeywordTaskQueue = (
    page: puppeteer.Page, 
    options: {[x: string]: unknown}     // 型をはっきりと指定できないかなぁ...
    ) => {
    const { keyword, tas, author } = options;
    tasks.push(() => search(page, keyword as string));
    // TODO: NavigationのwaitFoHTTPResponseのセットアップ
    tasks.push(() => (new Navigation()).navigateBy(page, page.keyboard.press('Enter')));
    tasks.push((res: (puppeteer.HTTPResponse | any)[]) => {
        const response: puppeteer.HTTPResponse = res.shift();
        return response.json()
            .catch(err => {
                // error handling for response.json()
            });
    });
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
    tasks.push(/* collect from result page parallel execution. */);
    tasks.push(/* collect from artwork page parallel execution. */)
    return tasks;
};