/***************************************************************
 * AssembleParallelPageSequences class
 * 
 * Description:
 * 
 * puppeteer.Pageインスタンスの並列処理タスクを生成するためのクラス。
 * 
 * concurrencyプロパティの数にしたがって逐次処理を生成する。
 * 
 * 以下の基本的な流れで組み立てられるpromiseチェーンを一つのタスクとして、そのタスクの連続からなる逐次処理を組み立てる。
 * 
 * sequenceの逐次処理：
 * 1. Prepare to navigate
 * 2. Navigate
 * 3. Solve returned HTTPResponses from Navigate process
 * 4. Collect data from returned value from solving http response process
 * 5. Error handling
 * 
 * 逐次処理群はrun()メソッドで並列処理される。
 * 
 * 各逐次処理はCollect.execute()が実行され指定のデータを取得しcollectedプロパティへ格納する。
 * 
 * pageの並列処理される逐次処理群を組み立てる
 * ほとんどのメソッドはpromiseチェーンのthen()から呼び出されることを想定する。
 * それらメソッドを組み立てるための機能を提供する。
 * このクラスが組み立てをするのではない。組み立ては呼び出し側に任される。
 * 
 * Means of 「組み立てる」:
 * 
 * setup: 汎用的な組み立てるという意味合い
 * put together: 寄せ集めるという意味合いが強い
 * assemble: 複雑なものを組み立てる意味合いが強い
 * 
 * NOTE: `AssemblerOfParallelPageSequences`の方がいいかも...
 * 
 * TODO: 呼び出し側でkeywordやtagやauthor情報を渡される。その時にオプショナルで実行できる処理を追加できるようにしなくてはならない
 * 
 * なので、...
 * - httpresponseのbody情報の中には各artworkのtag情報は含まれているか？
 * author情報は含まれているので取得可能
 * 
 * 呼出時は、iIllustMangaDataElement[]からcollector.execute()するときに
 * フィルタリング処理を挟めばよい
 * ************************************************************/ 
/**
 * TODO: this.collectedの型を柔軟にするために
 * 
 * (httpresponse|any)[]
 * > httpresponse
 * > httpresponse body
 * > aDataIWant(type T)
 * > modified-data(like T[keyof T][] or T[] ): this.collectedが抱えることになるデータ
 * 
 * ということで、
 * T型は何かといえば、http response bodyから抜き出したデータ型であり、
 * 実際にはthis.collectedの型になるとは限らないのである
 * 
 * this.collectedの型は使う側の都合によって決まるので不明である。
 * 
 * */ 
import type puppeteer from 'puppeteer';
import type { Collect, iFilterLogic } from './Collect';
import type { Navigation } from './Navigation';

export type iResponsesResolveCallback<T> = (responses: (puppeteer.HTTPResponse | any)[], params?: any) => T[] | Promise<T[]>;

/****
 * @class
 * @type {T} - The type of `collected` variable. 最終的にクラスはT[keyof T][]のデータを取り出すことになる。
 * @constructor
 *  @param {puppeteer.Browser} browser - puppeteer browser instance.
 *  @param {number} concurrency - Mamimum number of parallel process.
 *  @param {Navigation} navigation - Instance of Navigatoin class.
 *  @param {Collect} collector - Instance of Collect class
 * 
 * Property:
 * 
 * 
 * DEBUG:
 * T: httpresponse bodyを解決してひとまず収集するデータ型
 * U: 最終的に収集されるデータ型。T[]か、T[keyof T][]である
 * */ 
export class AssembleParallelPageSequences<T> {
    public sequences: Promise<void>[] = [];
    private pageInstances: puppeteer.Page[] = [];
    private collected: T[];
    private collectedProperties: T[keyof T][];
    // NOTE: 初期化する必要があるから仕方なくundefinedの可能性をつけている
    private responsesResolver: iResponsesResolveCallback<T> | undefined;
    constructor(
        private browser: puppeteer.Browser, 
        private concurrency: number,
        public navigation: Navigation,
        private collector: Collect<T>
    ){
        this.collected = [];
        this.collectedProperties = [];
        this.responsesResolver = undefined;
        // Methods binding. 
        this._generatePageInstances = this._generatePageInstances.bind(this);
        this._initializeSequences = this._initializeSequences.bind(this);
        this.initialize = this.initialize.bind(this);
        this.getPageInstance = this.getPageInstance.bind(this);
        this.getSequences = this.getSequences.bind(this);
        this.setResponseFilter = this.setResponseFilter.bind(this);
        this.setResponsesResolver = this.setResponsesResolver.bind(this);
        this.resolveResponses = this.resolveResponses.bind(this);
        this.collect = this.collect.bind(this);
        this.collectProperties = this.collectProperties.bind(this);
        this.filter = this.filter.bind(this);
        this.run = this.run.bind(this);
        this.getCollected = this.getCollected.bind(this);
        this.getCollectedProperties = this.getCollectedProperties.bind(this);
        this.errorHandler = this.errorHandler.bind(this);
        this.finally = this.finally.bind(this);
    };

    async _generatePageInstances() {
        return this.pageInstances.push(await this.browser.newPage());
    };

    _initializeSequences() {
        return this.sequences.push(Promise.resolve());
    };

    /***
     * Returns puppeteer Page instance which is indexed by iterator number.
     * 
     * */ 
    getPageInstance(circulator: number): puppeteer.Page | undefined {
        return this.pageInstances[circulator];
    };

    /***
     * Returns specified sequence promise by index number.
     * 
     * */ 
    getSequences(): Promise<void>[] {
        return this.sequences;
    };

    /***
     * Generate new instances according to this.concurrency
     * - Generate page instances.
     * - Generate sequence instances.
     * 
     * NOTE: DO NOT DO ANYTHING BEFORE CALL THIS initialize().
     * */ 
    async initialize() {
        for(let i = 0; i < this.concurrency; i++) {
            await this._generatePageInstances();
            this._initializeSequences();
        };
    };
    
    /**
     * Set Navigation's page.waitForResponse() filter 
     * 
     * */ 
    setResponseFilter(filter: (res: puppeteer.HTTPResponse) => boolean | Promise<boolean>) {
        this.navigation.resetFilter(filter);
    };
    
    /**
     * Set resolver for returned value from navigation process.
     * Callback must get all parameter from previous process.
     * So callback can be any function to suit any case.
     * 
     * 
     * */ 
    setResponsesResolver(resolver: iResponsesResolveCallback<T>): void {
        this.responsesResolver = resolver;
    };

    /***
     * Call this.responsesResolver if it's not undefined.
     * 
     * */ 
    resolveResponses(responses: (puppeteer.HTTPResponse | any)[], params?: any): T[] | Promise<T[]> {
        if(this.responsesResolver) return this.responsesResolver(responses, params); 
        else throw new Error("");
    }

    /***
     * Collect properties from data by specifying key which is keyof T.
     * */ 
    collectProperties(data: T[], key: keyof T): void {
        this.collector.setData(data);
        if(key !== undefined) {
            this.collectedProperties = [...this.collectedProperties, ...this.collector.collectProperties(key)];
        }
    };

    /***
     * 
     * なんだか意味のないことをしているなぁ
     * */ 
    collect(data: T[]): void {
        this.collector.setData(data);
        this.collected = [...this.collected, ...this.collector.getData()];
    }

    /***
     * @param {T[]} data - 
     * @param {keyof T} key - The property name of data parameter.
     * @param {iFilterLogic} filterLogic - Filter logic that is required by Collect.filter().
     * 
     * T: {id: number, name: string, age: number}
     * data: [
     *  {id: 123, name: "Jango", age: 25},
     *  {id: 456, name: "Junko", age: 24},
     *  {id: 789, name: "Jaguar", age: 23},
     *  ...
     * ]
     * key: 'id'
     * filterLogic:
     * */ 
    filter(data: T[], filterLogic: iFilterLogic<T>): T[] {
        this.collector.setData(data);
        return this.collector.filter(filterLogic);
    };

    run(): Promise<void[]> {
        return Promise.all(this.sequences);
    };

    getCollectedProperties(): T[keyof T][] {
        return [...this.collectedProperties];
    };

    getCollected(): T[] {
        return [...this.collected];
    };

    errorHandler(e: Error, occuredSequenceNumber?: number) {
        const message: string = e.message + (occuredSequenceNumber === undefined ? "" : occuredSequenceNumber);
        console.error(message);
        this.finally();
        throw e;
    };

    /**
     * This method must be invoked when all tasks are done.
     * This method is not invoked automatically. 
     * Call this explicitly manually.
     * 
     * - Close all generated puppeteer page instances.
     * - Clear all sequences promises.
     * 
     * Might browser close.
     * */ 
    finally() {
        // DEBUG:
        console.log("Closing all instances of acquireFromResultPage.ts...");

        if(this.sequences.length > 0) {
            this.sequences = [];
        }
        if(this.pageInstances.length > 0) {
            this.pageInstances.forEach(p => p.close());
            this.pageInstances = [];
        }
        // if(this.browser !== undefined){
        //     this.browser = undefined;
        // }
    };
};

/*
動作
- `collect byKeyword`: キーワード検索をしてオプションの条件指定を満たす作品のメタデータを収集する(JSONファイルで保存する)
- `collect fromBookmark`: ブックマークからオプションの条件指定を満たす作品のメタデータを収集する(JSONファイルで保存する)
- `bookmark`: (キーワード検索をして)オプションの条件指定を満たす作品をブックマークする
- `download fromBookmark`: ブックマークから条件指定に一致するデータをダウンロードする
- `download byKeyword`: キーワード検索から条件指定に一致するデータをダウンロードする

each options:

条件指定
    検索条件
    - keyword: 検索キーワード
    収集条件
    - tags: 指定のタグがすべて含まれていること
    - userName: 指定の作者であること
    - bookmarkOver: 指定のブックマーク数を誇ること
動作
- bookmarkIt: 条件を満たすartworkをブックマークする
- downloadIt: 条件を満たすartworkをダウンロードする
- unbookmarkIt: 条件を満たすartworkをブックマーク解除する
- 

*/ 