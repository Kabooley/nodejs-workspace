/************************************************************
 * AssembleParallelPageSequences.ts::filter()へ渡すfilterLogicの定義
 * 
 * NOTE: 
 * スコープ問題(必要な引数がスコープできない)
 * どこで呼び出されるべきなのかいまいち定まらない
 * 
 * 
 * **********************************************************/ 
import type { iFilterLogic } from '../Collect';
import type { iIllustData } from './typeOfArtworkPage';
import type { iCollectOptions } from '../../commandParser/commandModules/collectCommand';

/***
 * @param {iIllustData[]} data - 
 * @return {boolean}
 * 
 * すべての条件を満たしたらtrue
 * optionsをfilterLogicへ渡すために、クロージャにしている。
 * 
 * 何をフィルタリングしたいのかは場合に因るので内容はハードコーディングである。
 * */
export const generateFilterLogic = (options: iCollectOptions): iFilterLogic<iIllustData> => {
    return filterLogic;
};

export const filterLogic: iFilterLogic<iIllustData> = (data, options: iCollectOptions) => {
    let result: boolean = true;
    const { bookmarkOver } = options;
    const { bookmarkCount } = data;
    if(bookmarkOver !== undefined) {
        result = result && (bookmarkCount >= bookmarkOver)
    }
    // 
    // 後から追加可能
    // resultとの比較をすること
    // 
    return result;
}