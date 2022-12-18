import type puppeteer from 'puppeteer';
import { AssembleParallelPageSequences } from '../AssembleParallelPageSequences-2';
import type { iIllustData } from './typeOfArtworkPage';

type iAssemblerNavigationProcess<T> = (this: AssembleParallelPageSequences<T>) => Promise<(puppeteer.HTTPResponse | any)[]>;


export const navigationProcess: iAssemblerNavigationProcess<iIllustData> = function(circulator: number) {
    this.setResponseFilter(
		// TODO: スコープ問題
		// artworkページにおいては、idとurlが必要
	);
	return this.navigation.navigateBy(this.getPageInstance(circulator)!, this.getPageInstance(circualtor)!.goto("", { waitUntil: ["load", "networkidle2"]}));

}