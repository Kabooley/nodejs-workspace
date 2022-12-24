/************************************************************
 * AssembleParallelPageSequences-2.setupSequence()のthen()ハンドラ内部で
 * 呼び出されることになる関数。
 * then()ハンドラの日キス取る引数`resolved: T`を検査する役割を持つ。
 * 
 * (resolved: T) --> filterLogic() --> boolean
 * 
 * 検査内容は場合による。
 * filterLogic()は`iFilterLogic`に従わなくてはならない。
 * **********************************************************/ 
import type { iFilterLogic } from '../Collect';
import type { iIllustData } from './typeOfArtworkPage';
import array from '../../utilities/array';

// TODO: 後でコマンド関係を別ファイルへまとめること
interface iOptions {
    bookmarkOver?: number;
    tags?: string[];
    userName?: string;
    keyword: string;
};


/***
 * optionsの求めるものが、data: Tへ含まれているのかの検査
 * filterLogic()はどのコマンドだったのか関知しない。
 * 
 * どのオプションが渡されたのかを関知する。
 * 
 * optionsのすべてがdataに含まれているときだけtrueを返すので
 * filterLogicの内容はiFilterLogic<T>のT型にのみ依存する。
 * 
 * TODO: 呼出もとでどうやってoptionsを渡すのか未解決である
* */ 
export const filterLogic: iFilterLogic<iIllustData> = (data: iIllustData, options: iOptions) => {
    let result: boolean = true;
    // const { bookmarkOver, tags, userName, keyword } = options;
    const { bookmarkCount, tags } = data;
    if(options.bookmarkOver !== undefined) {
        result = result && (bookmarkCount >= options.bookmarkOver)
    }
    if(options.tags !== undefined && options.tags.length) {
        result = result 
        && // TODO: 配列同士の比較。TODO: tagsは本当に{}型なのか？調査。
        array.includesAll(tags, options.tags)
    }
    // 
    // 後から追加可能
    // resultとの比較をすること
    // 
    return result;
};



/***
 * @param {iIllustData[]} data - 
 * @return {boolean}
 * 
 * すべての条件を満たしたらtrue
 * optionsをfilterLogicへ渡すために、クロージャにしている。
 * 
 * 何をフィルタリングしたいのかは場合に因るので内容はハードコーディングである。
 * */
// export const generateFilterLogic = (options: iCollectOptions): iFilterLogic<iIllustData> => {
//     return filterLogic;
// };
