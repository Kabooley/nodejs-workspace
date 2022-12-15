/*********************************************************************
 * Ver:2
 * branch: feat-action-integlation
 * ******************************************************************/ 
import { timeStamp } from 'console';
import type puppeteer from 'puppeteer';
import type { Collect, iFilterLogic } from './Collect';
import type { Navigation } from './Navigation';

export type iResponsesResolveCallback<T> = (responses: (puppeteer.HTTPResponse | any)[], params?: any) => T[] | Promise<T[]>;

// NOTE: Not then handler. then handler returns below type function.
type iAssemblerNavigationProcess<T> = (this: AssembleParallelPageSequences<T>) => Promise<(puppeteer.HTTPResponse | any)[]>;
type iAssemblerResolveProcess<T> = (this: AssembleParallelPageSequences<T>, responses: (puppeteer.HTTPResponse | any)[]) => Promise<T[]>;
type iAssemblerSolutionProcess<T> = (this: AssembleParallelPageSequences<T>, resolved: T[]) => Promise<void>;
type iAssemblerErrorHandlingProcess = (e: Error) => void;


export class AssembleParallelPageSequences<T> {
    public sequences: Promise<void>[] = [];
    private pageInstances: puppeteer.Page[] = [];
    private collected: T[];
    private collectedProperties: T[keyof T][];
    // NOTE: 初期化する必要があるから仕方なくundefinedの可能性をつけている
    // private responsesResolver: iResponsesResolveCallback<T> | undefined;
    private navigationProcess: iAssemblerNavigationProcess<T> | undefined;
    private resolveProcess: iAssemblerResolveProcess<T> | undefined;
    private solutionProcess: iAssemblerSolutionProcess<T> | undefined;
    private errorHandlingProcess: iAssemblerErrorHandlingProcess | undefined;
    constructor(
        private browser: puppeteer.Browser, 
        private concurrency: number,
        public navigation: Navigation,
        private collector: Collect<T>
    ){
        this.collected = [];
        this.collectedProperties = [];
        // this.responsesResolver = undefined;
        this.navigationProcess = undefined;
        this.resolveProcess = undefined;
        this.solutionProcess = undefined;
        this.errorHandlingProcess = undefined;
        // Methods binding. 
        // NOTE: bind()は元の関数の関数の型をanyにしてしなうとのこと...
        // https://typescript-jp.gitbook.io/deep-dive/main-1/bind
        // しかし型推論をみるにそんなことはないんだけどね
        this._generatePageInstances = this._generatePageInstances.bind(this);
        this._initializeSequences = this._initializeSequences.bind(this);
        this.initialize = this.initialize.bind(this);
        this.getPageInstance = this.getPageInstance.bind(this);
        this.getSequences = this.getSequences.bind(this);
        this.setResponseFilter = this.setResponseFilter.bind(this);
        // this.setResponsesResolver = this.setResponsesResolver.bind(this);
        // this.resolveResponses = this.resolveResponses.bind(this);
        this.collect = this.collect.bind(this);
        this.collectProperties = this.collectProperties.bind(this);
        this.filter = this.filter.bind(this);
        this.run = this.run.bind(this);
        this.getCollected = this.getCollected.bind(this);
        this.getCollectedProperties = this.getCollectedProperties.bind(this);
        this.errorHandler = this.errorHandler.bind(this);
        this.finally = this.finally.bind(this);
        // 
        // NOTE: new added
        // 
        this.setupSequence = this.setupSequence.bind(this);
        this.setNavigationProcess = this.setNavigationProcess.bind(this);
        this.setResolvingProcess = this.setResolvingProcess.bind(this);
        this.setSolutionProcess = this.setSolutionProcess.bind(this);
        this.setErrorHandlingProcess = this.setErrorHandlingProcess.bind(this);
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
    
    // /**
    //  * Set resolver for returned value from navigation process.
    //  * Callback must get all parameter from previous process.
    //  * So callback can be any function to suit any case.
    //  * 
    //  * 
    //  * */ 
    // setResponsesResolver(resolver: iResponsesResolveCallback<T>): void {
    //     this.responsesResolver = resolver;
    // };

    // /***
    //  * Call this.responsesResolver if it's not undefined.
    //  * 
    //  * */ 
    // resolveResponses(responses: (puppeteer.HTTPResponse | any)[], params?: any): T[] | Promise<T[]> {
    //     if(this.responsesResolver) return this.responsesResolver(responses, params); 
    //     else throw new Error("");
    // }

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
     * NOTE: Nothing returns.
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

    /***
     * NOTE: Error handler for this.run(). Not for each sequence chain.
     * Handler for each sequence chain is this.errorHandlingProcess.
     * */ 
    errorHandler(e: Error, occuredSequenceNumber?: number) {
        const message: string = e.message + (occuredSequenceNumber === undefined ? "" : occuredSequenceNumber);
        console.error(message);
        
        // DEBUG: Shoot screen shot when got error.
        if(occuredSequenceNumber !== undefined 
            && this.getPageInstance(occuredSequenceNumber) !== undefined)
                this.getPageInstance(occuredSequenceNumber)!.screenshot({type: "png", path: `./dist/assemblerErrorHandlerInSequence-${occuredSequenceNumber}.png`})
        
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

    // ----
    // NOTE: new added
    // ---

    /***
     * Set up single task of sequence.
     * @param { number } index - Iterator of this.sequences
     * 
     * TODO: pageインスタンスには正しくアクセスできているのか？
     * */ 
    setupSequence(index: number) {
		if(this.getSequences()[index] === undefined 
            || this.getPageInstance(index) === undefined
        ) throw new Error("ReangeError: index accessing out of range or getSequences()");
		
        if(
            this.navigationProcess === undefined
            || this.resolveProcess === undefined
            || this.solutionProcess === undefined
            || this.errorHandlingProcess === undefined
        ) throw new Error("Error: Process methods may not setup yet.");
        
        this.getSequences()[index] = this.getSequences()[index]!
        .then(() => this.navigationProcess!())
        .then((responses: (puppeteer.HTTPResponse|any)[]) => this.resolveProcess!(responses))
        .then((resolved: T[]) => this.solutionProcess!(resolved))
        .catch(e => this.errorHandler(e));
	};

	setNavigationProcess(navigationProcess: iAssemblerNavigationProcess<T>) {
		this.navigationProcess = navigationProcess.bind(this);
	};

	// setResponsesResolverの名前を変更するだけ
	setResolvingProcess(resolveProcess: iAssemblerResolveProcess<T>) {
		this.resolveProcess = resolveProcess.bind(this);
	};

	setSolutionProcess(solutionProcess: iAssemblerSolutionProcess<T>) {
		this.solutionProcess = solutionProcess.bind(this);
	};

	setErrorHandlingProcess(errorHandlingProcess: iAssemblerErrorHandlingProcess) {
		this.errorHandlingProcess = errorHandlingProcess.bind(this);
	};
};