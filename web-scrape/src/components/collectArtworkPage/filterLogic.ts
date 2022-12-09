/************************************************************
 * AssembleParallelPageSequences.ts::filter()へ渡すfilterLogicの定義
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
    return function filterLogic(data): boolean  {
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
    };
};