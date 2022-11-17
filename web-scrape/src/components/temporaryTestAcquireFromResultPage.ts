import * as puppeteer from 'puppeteer';
import type { iIllustMangaDataElement, iBodyIncludesIllustManga } from '../constants/illustManga';
import { Collect } from './Collect';
import { Navigation} from './Navigation';
import mustache from '../utilities/mustache';
import { retrieveDeepProp } from '../utilities/objectModifier';

import { CollectResultPage, CollectResultPage_2 } from './acquireFromResultPage';


type iResponsesResolver<TO> = (responses: (puppeteer.HTTPResponse | any)[]) => TO | Promise<TO>;

const resolver: iResponsesResolver<iIllustMangaDataElement[]> = async (responses:(puppeteer.HTTPResponse | any)[]): Promise<iIllustMangaDataElement[]> => {
    // json() will throw if response.shift() is not parsable via json.parse()
    const response = await responses.shift().json() as iBodyIncludesIllustManga;

    const resolved = retrieveDeepProp<iIllustMangaDataElement[]>(["body", "illustManga", "data"], response);

    if(resolved === undefined) throw new Error("");
    return resolved;
};



// TEMPORARY GLOABL
const url: string = "https://www.pixiv.net/tags/{{keyword}}/artworks?p={{i}}&s_mode=s_tag";
const filterUrl: string = "https://www.pixiv.net/ajax/search/artworks/{{keyword}}?word={{keyword}}&order=date_d&mode=all&p={{i}}&s_mode=s_tag&type=all&lang=ja";


// test for ver.3
(async function() {
    const keyword: string = "COWBOYBEBOP";
    const browser: puppeteer.Browser = await puppeteer.launch();
    const navigation = new Navigation();
    const collector = new Collect<iIllustMangaDataElement>();
    const collectorOfResult = new CollectResultPage<iIllustMangaDataElement>(
        browser, 4, keyword, navigation, collector
    );

    // pageインスタンスをconcurrencyに従って生成する
    // sequencesをconcurrencyにしたがって生成する
    await collectorOfResult.initialize();
    collectorOfResult.setResponsesResolver<iIllustMangaDataElement[]>(resolver);
    for(let i = 1; i <= 100; i++) {
        const circulator: number = i % 4;
        collectorOfResult.updateIterates(i);    // いらないかも？
        let promise = collectorOfResult.getSequence(circulator)!;
        promise = collectorOfResult.getSequence(circulator)!
        // 1. Prepare to navigate. Return void.
        // 
        // 結局この形が一番だと思う...
        .then(() => collectorOfResult.resetResponseFilter(
            (res: puppeteer.HTTPResponse) => res.status() === 200 && res.url() === mustache(filterUrl, {keyword: encodeURIComponent(keyword), i: i}))
        )
        // 2. Navigate: Return (puppeteer.HTTPResponse | any)[] 
        // that express Navigation.navigateBy() return value. 
        .then(() => collectorOfResult.navigation.navigateBy(
            collectorOfResult.getPageInstance(circulator)!, 
            collectorOfResult.getPageInstance(circulator)!
            .goto(mustache(url, {keyword: encodeURIComponent(keyword), i: i}))
        ))
        // 3. Soleve returned value to specified data
        .then(collectorOfResult.resolveResponses)
        // 4. get specified data and contain that.
        .then((data: iIllustMangaDataElement[]) => collectorOfResult.collect(data, "id"))
        // 5. Error handling
        .catch()
    }
    await collectorOfResult.run();
    const result = collectorOfResult.getResult();
    collectorOfResult.finally();

    console.log(result);
})();


/***
 * Navigationインスタンスの変更はnavigationインスタンスに対して実行する
 * CollectResultPage2のインスタンスは呼び出さないとしてみる
 * 
 * */ 
(async function() {
    // 同時実行数上限
    const concurrency: number = 5;
    const keyword: string = "COWBOYBEBOP";
    const browser: puppeteer.Browser = await puppeteer.launch();
    const navigation = new Navigation();
    const collector = new Collect<iIllustMangaDataElement>();
    const collectorOfResultPage = new CollectResultPage_2(
        browser, 4, navigation, collector);

    const generateNavigationFilter = (i: number) => {
        return (res: puppeteer.HTTPResponse): boolean | Promise<boolean> => {
            return res.status() === 200 
            && res.url() === mustache(filterUrl, {keyword: encodeURIComponent(keyword), i: i})
        }
    };

    let circulator: number = 0;
    // Generate instances: pages, sequences
    /*******************************************
     * NOTE: 勝手に理想を記述してみただけ。
     * 実装はまだ
     * *****************************************/ 
    await collectorOfResultPage.initialize();
    for(let i = 1; i < 100; i++) {
        circulator = i % concurrency;
        // Generate task 
        // update navigation set for new loop process.
        collectorOfResultPage.updateNavigationFilter(generateNavigationFilter(i));
        // navigation
        collectorOfResultPage.updateNavigationTrigger(
            collectorOfResultPage.getPageInstance(circulator).goto(
                mustache(url, {keyword: encodeURIComponent(keyword), i: i})
            )
        );
        // get navigation returned value
        collectorOfResultPage.updateParser();
        // parse returned value and retrieve data from http response
        // run executor (something like contain data from retrieved data)
        collectorOfResultPage.updateExecutor();

        // タスクを一つ組み立てる
        // どのsequenceでどのpageインスタンスなのかをcirculatorで
        // 指定する
        collectorOfResultPage.generateTask(circulator);
    }
    await collectorOfResultPage.run();
    const result = collectorOfResultPage.getResult();
    collectorOfResultPage.finally();

})();