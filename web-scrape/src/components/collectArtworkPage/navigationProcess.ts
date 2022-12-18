import type { iIllustData } from './typeOfArtworkPage';
import type { iAssemblerNavigationProcess } from '../AssembleParallelPageSequences-2';
import type { AssembleParallelPageSequences } from '../AssembleParallelPageSequences-2';


/***
 * thisはちゃんと欲しいものをさせている
 * 
 * */ 
export const navigationProcess: iAssemblerNavigationProcess<iIllustData> = function(
    // `this`を明示的に指定しなくてはエラーが出る。実行時に問題が起こりそうである
    // (引数としてインスタンス渡していないじゃんみたいな)
    this: AssembleParallelPageSequences<iIllustData>,
    circulator: number) {
    return this.navigation.navigateBy(
        this.getPageInstance(circulator)!,
        this.getPageInstance(circulator)!.goto("", { waitUntil: ["load", "networkidle2"]})
    );
};
