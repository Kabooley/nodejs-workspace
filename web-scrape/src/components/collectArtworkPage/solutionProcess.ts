/*********************************************************************
 * 
 * 
 * *******************************************************************/ 
import type { iIllustData } from './typeOfArtworkPage';
import type { iAssemblerSolutionProcess } from '../AssembleParallelPageSequences-2';
import type { AssembleParallelPageSequences } from '../AssembleParallelPageSequences-2';

export const solutionProcess: iAssemblerSolutionProcess<iIllustData> = function(
    this: AssembleParallelPageSequences<iIllustData>,
    index: number,
    resolved: iIllustData[]
) {
    const element: iIllustData | undefined = resolved.shift();
    // 要素がなくてもエラーを起こすのではなく、無視する。
    if(element === undefined || !filterLogic(element)) return;
    return this.executeAction(element);
};
