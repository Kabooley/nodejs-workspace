/******************************************************************
 * `collect byKeyword` command task genearation.
 * 
 * `collect byKeyword` commandに基づく一連の処理を逐次処理として組み立てる。
 * 
 * 最終的にTaskQueue::sequentialAsyncTasks()へtasks:iSequentialAsyncTask[]として渡されて
 * そこでpromiseチェーン化される。
 * なのでここではtasksを生成する。
 * 
 * Promiseチェーンからなる逐次処理に、
 * あらかじめ定められているタスクを追加していく。
 * 逐次処理のPromiseチェーンが組み立てられたらそのPromiseを返す。
 * 
 * task:
 * - fill search form by keyword
 * - navigate to keyword search result page
 * - get its http response
 * - parse its http response
 * - generate collecting process
 * - return collected data
 * 
 * `collect byKeyword`のオプション：
 * - keyword: string - 検索キーワード
 * - tas: string - 検索結果作品のタグ群に含まれていてほしいタグ
 * - author: string - 
 * ****************************************************************/ 
import type puppeteer from 'puppeteer';
import type { iSequentialAsyncTask } from '../utilities/TaskQueue';
import type { iIllustMangaDataElement, iIllustManga, iBodyIncludesIllustManga } from '../constants/illustManga';
import type { iFilterLogic  } from './Collect';
import { search } from './search';
import { Navigation } from './Navigation';
import { Collect } from './Collect';
import { AssembleParallelPageSequences } from './AssembleParallelPageSequences';
import { retrieveDeepProp } from '../utilities/objectModifier';
import array from '../utilities/array';
import mustache from '../utilities/mustache';
import { options } from 'yargs';

let tasks: iSequentialAsyncTask[] = [];
const url: string = "https://www.pixiv.net/tags/{{keyword}}/artworks?p={{i}}&s_mode=s_tag";
const filterUrl: string = "https://www.pixiv.net/ajax/search/artworks/{{keyword}}?word={{keyword}}&order=date_d&mode=all&p={{i}}&s_mode=s_tag&type=all&lang=ja";

type iResponsesResolveCallback<T> = (params: any) => T[] | Promise<T[]>;


/***
 * 
 * 
 * */ 
const resolver: iResponsesResolveCallback<iIllustMangaDataElement> = async (responses: (puppeteer.HTTPResponse | any)[]) => {
    const response = await responses.shift().json() as iBodyIncludesIllustManga;
    const resolved: iIllustMangaDataElement[] = retrieveDeepProp<iIllustMangaDataElement[]>(["body", "illustManga", "data"], response);
    if(resolved === undefined) throw new Error("");
    return resolved;
};

/***
 * 
 * ほんまにクロージャでええんか?
 * */
const generateFilterLogic = (
    e: iIllustMangaDataElement,
    key: keyof iIllustMangaDataElement,
    requirement: string[]
    ): iFilterLogic<iIllustMangaDataElement> => {
    return function filterLogic() {
        if(e[key] !== undefined){
            return array.includesAll(e[key], requirement);
        }
        else return false;
    }
}



/***
 * 
 * 
 * */ 
const assemblingCollectProcess = async (
    browser: puppeteer.Browser, numberOfProcess: number, numberOfPages: number
    ): Promise<AssembleParallelPageSequences<iIllustMangaDataElement> | undefined> => {
    try {
        const assembler = new AssembleParallelPageSequences<iIllustMangaDataElement>(
            browser, numberOfProcess, new Navigation(), new Collect<iIllustMangaDataElement>()
        );

        await assembler.initialize();
        assembler.setResponsesResolver(resolver);

        for(let page = 1; page <= numberOfPages; page++) {
            const circulator: number = page % numberOfProcess;
            if(assembler.getSequence(circulator) !== undefined
                && assembler.getPageInstance(circulator) !== undefined
            ) {
                let sequence = assembler.getSequence(circulator)!;
                const page = assembler.getPageInstance(circulator)!;
                assembler.setResponseFilter((res: puppeteer.HTTPResponse) => 
                res.status() === 200 
                && res.url() === mustache(filterUrl, {keyword: encodeURIComponent(keyword), i: page}));

                // TODO: getSequence()を、要素を一つ返すしようじゃなくて配列を返す仕様にする
                // sequenceを外に出してしまっているのでこれだとassemblerのsequenceに上書きできてないかもしれない
                sequence = sequence
                .then(() => assembler.navigation.navigateBy(page, page.goto(mustache(url, {keyword: encodeURIComponent(keyword), i:page}))))
                .then((responses: (puppeteer.HTTPResponse | any)[]) => assembler.resolveResponses!(responses))
                // TODO: tagやauthorを指定されているときに、assembler.collect()の段階でフィルタリングを設けなくてはならない
                .then((data: iIllustMangaDataElement[]) => assembler.filter(data, key, filterLogic))
                .catch((e) => assembler.errorHandler(e))
            }
        };
        return assembler;
    }
    catch(e) {
    }
};

/***
 * Get http response body data and decides how many process (page instances) should be generated.
 * 
 * */
const decideNumberOfProcess = (illustManga: iIllustManga) => {
    const { data, total } = illustManga;
    const numberOfPages: number = Math.floor(total / data.length);
    let numberOfProcess: number = 1;

    if(numberOfPages >= 20 && numberOfPages < 50) {
        numberOfProcess = 2;
    }
    else if(numberOfPages >= 50 && numberOfPages < 100) {
        numberOfProcess = 5;	
    }
    else if(numberOfPages >= 100) {
        numberOfProcess = 10;
    }
    else {
        numberOfProcess = 1;
    };

    // return {
    //     numberOfProcess: numberOfProcess, 
    //     numberOfPages: numberOfPages
    // };

    return assemblingCollectProcess(browser, numberOfProcess, numberOfPages);
};

interface iOptions {
    keyword: string;
    tag?: string;
    author?: string;
};


/****
 * Set up tasks which required by "collectByKeyword" command and return tasks.
 * The tasks are sequential
 * 
 * */ 
export const setupCollectByKeywordTaskQueue = (
    browser: puppeteer.Browser,
    page: puppeteer.Page, 
    options: iOptions
    ) => {
    const { keyword, tag, author } = options;

    // setting up task queue.
    // 
    // 1. fill search form with keyword.
    tasks.push(() => search(page, keyword));
    // 2. Navigate to keyword search result page.
    tasks.push(() => {
        const navigation = new Navigation();
        navigation.resetFilter((res: puppeteer.HTTPResponse) => 
            res.status() === 200 
            && res.url() === mustache("https://www.pixiv.net/ajax/search/artworks/${{eyword}}?word=${{eyword}}", {keyword: encodeURIComponent(keyword)})
        );
        return navigation.navigateBy(page, page.keyboard.press('Enter'))
    });
    // 3. Check the response includes required data.
    tasks.push((res: (puppeteer.HTTPResponse | any)[]) => res.shift().json() as iBodyIncludesIllustManga);
    // 4. Resolve HTTPResponse body to specific type.
    tasks.push((responseBody: iBodyIncludesIllustManga): iIllustManga => {
        const resolved = retrieveDeepProp<iIllustManga>(["body", "illustManga"], responseBody);
        if(resolved === undefined) throw new Error("");
        return resolved;
    })
    // 5. Define numberOfProcess according to number of result. 
    tasks.push(decideNumberOfProcess);
    // 5. setup parallel sequences
    tasks.push((p: {numberOfProcess: number, numberOfPages: number}) => 
        assemblingCollectProcess(browser, p.numberOfProcess, p.numberOfPages));
    // 6. run assembled sequences.
    tasks.push((assembler: AssembleParallelPageSequences<iIllustMangaDataElement>) => assembler.run());
    // 7. 実行結果の取得
    // TODO: assemblerへのアクセスが必要であるがスコープ外である
    tasks.push(())
    return tasks;
};