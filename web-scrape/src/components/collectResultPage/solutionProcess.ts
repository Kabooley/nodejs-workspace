/**************************************************************
 * Retrieve `id` property from resolved data and contain it into 
 * this.collectedPropperties.
 * 
 * Whatever command is, process is only collect id from resolved data.
 * ************************************************************/
import type { iIllustMangaDataElement } from '../../constants/illustManga';
import type { iAssemblerSolutionProcess } from '../AssembleParallelPageSequences-2';
import type { AssembleParallelPageSequences } from '../AssembleParallelPageSequences-2';
import { Collect } from '../Collect';


// Property that assembler will collect.
const key: keyof iIllustMangaDataElement = "id";


// TODO: AsembleParallelPageSequences.collectは除去できるか？
/**
 * 
 * ColelctをAssemblerの一部とするか、もしくはsetData()とか後からデータを預かる関数を設けるか、のどちらかになる
 * 
 * ひとまず以下のとおり、collectがAssemblerの一部でない方が自由度が高い。
 * 
 * NOTE: In case if Collect is not member of Assembler.
 * */ 
export const solutionProcess: iAssemblerSolutionProcess<iIllustMangaDataElement> = function(
    this: AssembleParallelPageSequences<iIllustMangaDataElement>,
    index: number,
    resolved: iIllustMangaDataElement[]
) {
    // DEBUG:
    console.log(`Solution process ${index}`);

    // assembler.collectProperties()と同じことをすればよい
    // 
    // idプロパティはthis.collectedPropertiesへ格納される
    const collector = new Collect<iIllustMangaDataElement>;
    // 例：
    // 何か条件を設けて合格した要素だけ取得したいとき:
    collector.setData(resolved);
    collector.setData(collector.filter(function(){ return true;}));
    collector.collectProperties(key).forEach(e => this.pushCollectingProperty(e));
};

// --- LEGACY ---

// /***
//  * 従来の通り
//  * */ 
// export const solutionProcess: iAssemblerSolutionProcess<iIllustMangaDataElement> = function(
//     this: AssembleParallelPageSequences<iIllustMangaDataElement>,
//     index: number,
//     resolved: iIllustMangaDataElement[]
// ) {
//     // assembler.collectProperties()と同じことをすればよい
//     // 
//     // idプロパティはthis.collectedPropertiesへ格納される
//     return this.collectProperties(resolved, key);
// };