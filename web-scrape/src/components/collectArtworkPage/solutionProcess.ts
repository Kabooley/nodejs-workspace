/*********************************************************************
 * 
 * 
 * *******************************************************************/ 
import type { iIllustData } from './typeOfArtworkPage';
import type { iAssemblerSolutionProcess } from '../AssembleParallelPageSequences-2';
import type { AssembleParallelPageSequences } from '../AssembleParallelPageSequences-2';
import { Action } from '../../action';


/**
 * TODO: Commandの内容を実行する
 * 
 * actionはassemblerが抱えることとする
 * ただし、呼び出しはaction.execute()のみで
 * 何をすべきなのかはAction自体が考えるものとする
 * */ 
export const solutionProcess: iAssemblerSolutionProcess<iIllustData> = function(
    this: AssembleParallelPageSequences<iIllustData>,
    index: number,
    resolved: iIllustData[]
) {
    const element: iIllustData | undefined = resolved.shift();
    if(element === undefined || !filterLogic(element)) return;
    // TODO: Actually, collecting is not necessary...
    this.getCollected().push(element);
    // page: puppeteer.Page
    // TODO: Action is not implemented yet. Define it.
    return this.action.execute()();
}