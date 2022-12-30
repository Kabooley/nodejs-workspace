/*********************************************************************
 * 
 * 
 * TODO: 如何にしてfilterLogicへoptionsを渡せばいいのか...
 * 
 * 要は、filterLogicを内包した状態のsolutionProcessを生成できればいい。
 * 
 * 
 * *******************************************************************/ 
import type { AssembleParallelPageSequences } from '../../AssembleParallelPageSequences-2';
import type { iFilterLogic } from '../../Collect';
import type { iPartialOptions } from '../../../commandParser/commandTypes';

// import type { iIllustData } from './typeOfArtworkPage';
import type { iAssemblerSolutionProcess } from '../../AssembleParallelPageSequences-2';

export class GenerateSolutionProcess<T> {
    private filterLogic: iFilterLogic<T> | undefined;
    private options: iPartialOptions | undefined;
    constructor() {};

    setFilterLogic(filterLogic: iFilterLogic<T>) {
        this.filterLogic = filterLogic;
    };

    setOptions(options: iPartialOptions) {
        this.options = options;
    };

    generateSolutionProcess() {
        // DEBUG:
        console.log("generateSolutionProcess()");

        const self = this;
        if(this.filterLogic === undefined || this.options === undefined) throw new Error("");
        return function solutionProcess__(
            this: AssembleParallelPageSequences<T>,
            index: number,
            resolved: T[]
        ): iAssemblerSolutionProcess<T> {
            // DEBUG:
            console.log(`${index}: solutionProcess`);
            
            const element: T | undefined = resolved.shift();
            // 要素がなくてもエラーを起こすのではなく、無視する。
            if(element === undefined || !self.filterLogic!(element, self.options!)) 
                throw new Error("generateSolutionProcess: there is no element in resolved array.");
            return this.executeAction(element);
        };
    }
};

// --- LEGACY ---
// 
// export const solutionProcess: iAssemblerSolutionProcess<iIllustData> = function(
//     this: AssembleParallelPageSequences<iIllustData>,
//     index: number,
//     resolved: iIllustData[]
// ) {
//     const element: iIllustData | undefined = resolved.shift();
//     // 要素がなくてもエラーを起こすのではなく、無視する。
//     if(element === undefined || !filterLogic(element)) return;
//     return this.executeAction(element);
// };

// export const wrapeerSolutionProcess = (filterLogic: iFilterLogic<iIllustData>, options: iPartialOptions): iAssemblerSolutionProcess<iIllustData> => {

//     return function solutionProcess_(
//         this: AssembleParallelPageSequences<iIllustData>,
//         index: number,
//         resolved: iIllustData[]
//     ) {
//         const element: iIllustData | undefined = resolved.shift();
//         // 要素がなくてもエラーを起こすのではなく、無視する。
//         if(element === undefined || !filterLogic(element, options)) return;
//         return this.executeAction(element);
//     };
// }