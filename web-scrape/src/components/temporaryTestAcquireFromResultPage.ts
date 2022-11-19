import * as puppeteer from 'puppeteer';
import type { iIllustMangaDataElement, iBodyIncludesIllustManga } from '../constants/illustManga';
import { Collect } from './Collect';
import { Navigation} from './Navigation';
import mustache from '../utilities/mustache';
import { retrieveDeepProp } from '../utilities/objectModifier';
import { AssembleParallelPageSequences } from './AssembleParallelPageSequences';



type iResponsesResolveCallback<T> = (params: any) => T[] | Promise<T[]>;

const resolver: iResponsesResolveCallback<iIllustMangaDataElement> = async (responses: (puppeteer.HTTPResponse | any)[]) => {
    const response = await responses.shift().json() as iBodyIncludesIllustManga;
    const resolved: iIllustMangaDataElement[] = retrieveDeepProp<iIllustMangaDataElement[]>(["body", "illustManga", "data"], response);
    if(resolved === undefined) throw new Error("");
    return resolved;
};




// TEMPORARY GLOABL
const url: string = "https://www.pixiv.net/tags/{{keyword}}/artworks?p={{i}}&s_mode=s_tag";
const filterUrl: string = "https://www.pixiv.net/ajax/search/artworks/{{keyword}}?word={{keyword}}&order=date_d&mode=all&p={{i}}&s_mode=s_tag&type=all&lang=ja";


// retry test ver.3
/**
 * やっぱりこの使い方が一番しっくりくるね
 * 
 * 細かいところの修正
 * */ 
{
    (async function() {
        const browser = await puppeteer.launch();
        const concurrency: number = 4;
        const numberOfTasks: number = 100;
        const keyword: string = "COWBOYBEBOP";
        const key: keyof iIllustMangaDataElement = "id";
        const collectorOfResult = new AssembleParallelPageSequences<iIllustMangaDataElement>(
            browser, 
            concurrency,
            new Navigation(),
            new Collect<iIllustMangaDataElement>()
        );

        // Generate page instances and promise sequences
        // according to number of concurrency.
        await collectorOfResult.initialize();
        collectorOfResult.setResponsesResolver(resolver);

        // generate tasks
        for(let i = 1; i <= numberOfTasks; i++) {
            const circulator: number = i % concurrency;
            if(collectorOfResult.getSequence(circulator) !== undefined
                && collectorOfResult.getPageInstance(circulator) !== undefined
            ) {
                let sequence = collectorOfResult.getSequence(circulator)!;
                const page = collectorOfResult.getPageInstance(circulator)!;
                collectorOfResult.setResponseFilter((res: puppeteer.HTTPResponse) => 
                res.status() === 200 
                && res.url() === mustache(filterUrl, {keyword: encodeURIComponent(keyword), i: i}));

                // TODO: 一旦sequenceのプロミスを外に出しちゃっているけど、これちゃんとthis.sequencesに格納されているのかしら？
                sequence = sequence
                .then(() => collectorOfResult.navigation.navigateBy(page, page.goto(mustache(url, {keyword: encodeURIComponent(keyword), i: i}))))
                .then((responses: (puppeteer.HTTPResponse | any)[]) => collectorOfResult.resolveResponses!(responses))
                .then((data: iIllustMangaDataElement[]) => 
                collectorOfResult.collect(data, key))
                .then(() => {
                    // something clean up
                })
                .catch((e) => collectorOfResult.errorHandler(e))
            }
        };
        await collectorOfResult.run();
        const result = collectorOfResult.getResult();
        console.log(`total number of collected id: ${result.length}`);
        console.log(result);
        collectorOfResult.finally();
    })();
};