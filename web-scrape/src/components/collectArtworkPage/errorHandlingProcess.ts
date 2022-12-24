/*********************************************************************
 * 
 * 
 * *******************************************************************/ 
import type { iIllustData } from './typeOfArtworkPage';
import type { iAssemblerErrorHandlingProcess } from '../AssembleParallelPageSequences-2';
import type { AssembleParallelPageSequences } from '../AssembleParallelPageSequences-2';

export const errorHandlingProcess: iAssemblerErrorHandlingProcess = function(
    this: AssembleParallelPageSequences<iIllustData>,
    error: Error, 
    index: number
) {
    // DEBUG:
    console.error(`Error: @Sequences-${index}. ${error.message}`);
    this.finally();
    throw error;
};
