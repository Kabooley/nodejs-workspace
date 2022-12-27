/**************************************************************
 * 
 * 
 * ************************************************************/
import type { iIllustMangaDataElement } from '../../constants/illustManga';
import type { iAssemblerSolutionProcess } from '../AssembleParallelPageSequences-2';
import type { AssembleParallelPageSequences } from '../AssembleParallelPageSequences-2';

export const solutionProcess: iAssemblerSolutionProcess<iIllustMangaDataElement> = function(
    this: AssembleParallelPageSequences<iIllustMangaDataElement>,
    index: number,
    resolved: iIllustMangaDataElement[]
) {

}
