/*********************************************************************
 * 
 * 
 * *******************************************************************/ 
import type { iIllustMangaDataElement } from '../../constants/illustManga';
import type { iAssemblerErrorHandlingProcess } from '../AssembleParallelPageSequences-2';
import type { AssembleParallelPageSequences } from '../AssembleParallelPageSequences-2';

export const errorHandlingProcess: iAssemblerErrorHandlingProcess = function(
    this: AssembleParallelPageSequences<iIllustMangaDataElement>,
    error: Error, 
    index: number
) {
    // DEBUG:
    console.error(`errorHandlingProcess(): @Sequences-${index}. ${error.message}`);
    // this.finally();
    throw error;
};
