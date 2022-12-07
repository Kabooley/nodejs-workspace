/****************************************************************
 * Part of sequential task of `collect byKeyword` command order.
 * This method will be used as Promise.then() handler.
 * 
 * **************************************************************/ 
import type { iIllustManga } from '../constants/illustManga';

/***
 * Get http response body data 
 * and decides how many process (page instances) should be generated.
 * 
 * @param {iIllustManga} illustManga - Specific data that was resolved by previous promise process.
 * @return {number} numberOfProcess - Number of process that derived according to this method.
 * @return {number} numberOfPages - Number of pages derived from the number of keyword search results.
 * */
export const decideNumberOfProcess = (illustManga: iIllustManga) => {
            
    // DEBUG:
    console.log("Decide number of process...");

    const { data, total } = illustManga;
    // 検索結果の全ページ数
    const numberOfPages: number = Math.floor(total / data.length);
    let numberOfProcess: number = 1;

    if(numberOfPages >= 20 && numberOfPages < 50) {
        numberOfProcess = 2;
    }
    else if(numberOfPages >= 50 && numberOfPages < 100) {
        numberOfProcess = 5;	
    }
    else if(numberOfPages >= 100) {
        numberOfProcess = 10;
    }
    else {
        numberOfProcess = 1;
    };

    // DEBUG:
    console.log(`number of process: ${numberOfProcess}, number of pages: ${numberOfPages}`);

    return {
        numberOfProcess: numberOfProcess, 
        numberOfPages: numberOfPages
    };
};
