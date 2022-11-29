/*********************************************************
 * param:
 * - idTable: Array of Artwork page url id.
 * - numberOfProcess: How many page instances are required.
 * - requirements: Required things which the artwork to have.
 * 
 * If the Page instance is only one:
 * - for(const id of idTable){ / sequential process detail / }
 * - sequential process detail : 
 *      - navigate to the specific url
 *      - get http response and solve it
 *      - retrieve data from solved data
 *      - find retrieved data for that including required data
 *      - If it does, then collect required data, or go next.
 * 
 * Or multiple page instances are required
 * 
 * 要は生成したPromiseの数だけ逐次処理が生み出される
 * その逐次処理はsequential process detailを指し
 * sequential process detailでは代わりにpage[circulator]が処理を担う
 * 
 * - Create promise chain and page instances as numberOfProcess requires.
 * - promises
 * - for(const id of idTable) { / Decorated sequential process detail / }
 *      const circulator = counter % numberOfProcess;
 *      promises[circulator] = promises[circulator]
 *      .then(() => sequential process detail )
 * *******************************************************/ 
import type puppeteer from 'puppeteer';
import type { iResponsesResolveCallback } from './AssembleParallelPageSequences';
import type { iCollectOptions } from '../commandParser/commandModules/collectCommand';
import * as jsdom from 'jsdom';
import { Navigation } from './Navigation';
import { Collect } from './Collect';
import { AssembleParallelPageSequences } from './AssembleParallelPageSequences';
import { retrieveDeepProp } from '../utilities/objectModifier';
import array from '../utilities/array';
import mustache from '../utilities/mustache';

// Annotations 

// iMetaPreloadData > iIllust > iIllustData
interface iMetaPreloadData {
    timestamp: string;
    illust: iIllust;
};

interface iIllust {
    // property key is artwork id.
    // Like this: {17263: iIllustData} 
    [key: string]: iIllustData;
};

interface iIllustData {
    illustId:string;
    illustTitle: string;
    illustComment: string;
    id: string;
    title: string;
    description: string;
    illustType: number;
    createDate: string;
    uploadDate: string;
    sl: number;
    urls: {
        mini: string;
        thumb: string;
        small: string;
        regular: string;
        original: string;
    },
    tags: {};
    pageCount: number;
    bookmarkCount: number;
    likeCount:number;
};

// GLOBAL
const { JSDOM } = jsdom;
const artworkPageUrl: string = "https://www.pixiv.net/artworks/{{id}}";

/***
 * Command `collectbyKeyword`'s options will be stored.
 * 
 * TODO: optionsの内、artworkページで取得するときに使うプロパティだけ取得するようにする
 * 
 * 検索結果ページで取得できるのはtagsとuserNameで、bookmarkは取得できない
 * 
 * options > 何らかのフィルタ > artworkページで通用するoptionsのプロパティだけのオブジェクト
 * 
 * とできればいい。
 * 
 * */ 
 const optionsProxy = (function() {
    let options = {} as iCollectOptions;
    return {
        set: function(v: iCollectOptions) {
            options = {
                ...options, ...v
            };
        },
        get: function() {
            return options;
        }
    };
})();

/***
 * options > 何らかのフィルタ 
 * > artworkページで通用するoptionsのプロパティだけのオブジェクト
 * という抽出を行う
 * 
 * optionsとvalidPropertiesを比較して、
 * 後者のプロパティ名が前者に含まれていたら、
 * そのプロパティのペアだけをオブジェクトとして返す
 * 
 * ということで2つの配列の比較
 * 
 * @param {T} options - T type Object. Not array.
 * @param {(keyof T)[]} validProperties - Array concist of property name of T.
 * */ 
const optionFilter = <T>(options: T, validProperties: (keyof T)[]): {[Property in keyof T]?: T[Property]} => {
    // TODO: 要実装
    // 実装で来たらassembler.filter()で必須の引数を渡せるように
}


/***
 * HTTPResponse resolver.
 * 
 * @param {string} id - ID of artwork that puppeteer now accessing. 
 * @return {[iIllustData]} - `iResponsesResolveCallback`型の都合上配列として返すことになっている(修正されるかも)
 * 
 * responses
 *  > iMetaPreloaddata
 *      > iIllust
 *          > iIllustData
 * 
 * TODO: `id`を、`iResponsesResolveCallback`を崩さず取得したい
 * 
 * 制約:
 * - assemblerのスコープ外である
 * - iResponsesResolveCallbackは引数を一つしか取れない(あとから引数を増やすという手段をとりたくない)
 * 
 * */ 
const resolver: iResponsesResolveCallback<iIllustData> = async (responses: (puppeteer.HTTPResponse | any)[]) => {
    // Pop out first element of responses.
    const response: puppeteer.HTTPResponse = responses.shift();
    // Check if the response is valid.
    if(
        !response.headers().hasOwnProperty("content-type")
        || !response.headers()["content-type"]!.includes('text/html')
    ) throw new Error("Error: Cannot retrieve HTTP Response body.");

    // Resolving HTTPResponse body data as iMetaPreloadData | undefined
    const { document } = new JSDOM(await response.text()).window;
    const json = document.querySelector('#meta-preload-data')!.getAttribute("content");
    const metaPreloadData: iMetaPreloadData | undefined = json ? JSON.parse(json): undefined;

    // Check if metaPreloadData is undefined or not.
    
    // NOTE: 一時的な都合で変数idをここに定義している。本来は外部から取得する
    const id = "12345";
    if(
        metaPreloadData === undefined
        || !metaPreloadData.hasOwnProperty('illust')
        || !metaPreloadData.illust[id]
    ) throw new Error("Error: Cannot retrieve 'illust' property from metadata");


    return [metaPreloadData.illust[id]];
};

const httpResponseFilter = (id: string) => {
    return function(response: puppeteer.HTTPResponse) {
        return response.status() === 200 
            && response.url() === mustache(artworkPageUrl, {id: id});
    }
};


const assemblingCollectProcess = async (
    browser: puppeteer.Browser,
    numberOfProcess: number,
    idTable: string[],
    options: iCollectOptions
) => {
    optionsProxy.set(options);
    const assembler = new AssembleParallelPageSequences<iIllustData>(
        browser, numberOfProcess, 
        new Navigation(), new Collect<iIllustData>()
    );

    try {
        // Assemblerの初期化
        await assembler.initialize();
        // 逐次処理中のHTTPResponseの解決を実行する関数のセット
        assembler.setResponsesResolver(resolver);

        // Generate sequential process as same as number of idTable.

        let counter: number = 0;
        for(const id of idTable) {
            const circulator = counter % numberOfProcess;
            const url = mustache(artworkPageUrl, {id: id});
            const page: puppeteer.Page = assembler.getPageInstance(circulator)!;
            if(page !== undefined && assembler.getSequences()[circulator] !== undefined) {
                assembler.getSequences()[circulator]
                = assembler.getSequences()[circulator]!
                // 1. Navigate to the url + id
                .then(() => {
                    assembler.setResponseFilter(httpResponseFilter(id));
                    return assembler.navigation.navigateBy(
                        page, page.goto(url, {waitUntil: ["load", "networkidle2"]}));
                })
                // 2. Resolve HTTP Response which from HTTPResponse filter
                .then((responses: (puppeteer.HTTPResponse | any)[]) => assembler.resolveResponses!(responses))
                // 3. 
                .then((resolved: iIllustData[]) => {
                    // TODO: pass id to assembler.filter callback
                    return assembler.filter(resolved, )
                })
                .catch(e => assembler.errorHandler(e))

            }
            else {
                console.error("Error: Page instance or sequence promise does not exist. Or the index accesses out range of array");
            }
        }

        return assembler.run().then(() => assembler.getResult()).catch(e => assembler.errorHandler(e)).finally(() => assembler.finally());
    }
    catch(e) {
        assembler.finally();
        throw e;
    }
}