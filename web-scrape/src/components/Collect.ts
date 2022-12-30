/********************************************************************
 * Special collect method set for Array data.
 * 
 * NOTE: This class treats Array data. Not object type.
 * This class does not save collected data. Only to be collected data.
 * 
 * Collectはどんなデータ型をthis.dataとして抱えることになるのかに関心があり、
 * CollectのメソッドはT
 * *******************************************************************/ 
import type { iPartialOptions } from '../commandParser/commandTypes';

//  export type iFilterLogic<T> = (e: T) => boolean;
 export type iFilterLogic<T> = (e: T, options: iPartialOptions) => boolean;

 /***
  * @type {T} - Type of the array element object.
  * 
  * */ 
  export class Collect<T> {
     private data: T[];
     constructor() {
         this.data = [];
         this.getData = this.getData.bind(this);
         this.setData = this.setData.bind(this);
         this.collectProperties = this.collectProperties.bind(this);
         this.filter = this.filter.bind(this);
     };
 
     /***
      * Collect value by specifying key name from object and return array of collection.
      * 
      * @param {T[]} data - Object from which the value is to be retrieved.
      * @param {keyof T} key - Key of object that passed as first argument and to be retrieved.
      * @return {T[keyof t][]} - Array 
      * 
      * */ 
     collectProperties(key: keyof T): T[keyof T][] {
         const arr = this.data.map((e: T) => {
             if(e[key] !== undefined) return e[key];
             else return undefined;
         });
         return arr.filter((v): v is Exclude<typeof v, undefined> => v !== undefined);
     };

    /***
     * Get copy of data.
     * */  
     getData(): T[] {
        return [...this.data];
     };
 
     /**
      * RESET data.
      * Remove reference of previous data.
      * 
      * NOTE: 無くしたい。
      * */ 
     setData(data: T[]): void {
         this.data = [];
         this.data.length = 0;
         this.data = [...data];
     };
 
    /**
     * Returns true if element `e` is passed filterLogic test.
     * 
     * */  
    filter(filterLogic: iFilterLogic<T>, options: iPartialOptions): T[] {
        return this.data.filter((e: T) => filterLogic(e, options));
    };  
 };


//  --- USAGE ---
// import type { iIllustMangaDataElement, iIllustManga, iBodyIncludesIllustManga } from '../constants/illustManga';

// const collector = new Collect<iIllustMangaDataElement>();
// const data: iIllustMangaDataElement[] = [
//     // omit
// ];
// // data.tagsに指定のタグがすべて含まれている要素からなる配列を返す
// const filterLogic: iFilterLogic<iIllustMangaDataElement> = (data) => {
//     const requiredTags = ["犬走椛", "射命丸文"];
//     let result: boolean = true;
//     if(data.tags !== undefined) {
//         requiredTags.forEach(tag => {
//             result = result && (data.tags!.includes(tag));
//         });
//         return result;
//     }
//     else {
//         return false;
//     }
// };

// // dataをcollectorへ保存する。
// collector.setData(data);
// // filterLogicに合格した要素からなる配列を返す
// console.log(collector.filter(filterLogic));
// // dataから`id`プロパティを取り出しそれからなる配列を返す
// console.log(collector.collectProperties("id"));
// // collectorへ保存されているdata(のコピー)を取得する
// console.log(collector.getData());
