/***********************************************
 * Array utilities.
 * 
 * *********************************************/

/***
 * Array includes some element of another array.
 * 
 * ref: https://stackoverflow.com/a/39893636
 * 
 * @param {any[]} compare - この配列が
 * @param {any[]} to - この配列の要素を一つ以上含むのか
 * @return {boolean} - 一つ以上含むならtrue
 * */ 
const includesAtLeast = (compare: any[], to: any[]): boolean => {
    return to.some(v => compare.includes(v));
};

/***
 * Array includes all element of another array.
 * 
 * ref: https://stackoverflow.com/a/53606357
 * 
 * @param {any[]} compare - この配列が
 * @param {any[]} to - この配列の要素をすべて含むのか
 * @return {boolean} - すべて含むならtrue
 * */ 
const includesAll = (compare: any[], to: any[]): boolean => {
    return to.every(v => compare.includes(v));
};


export default {
    includesAll, includesAtLeast
};