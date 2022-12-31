/*********************************************************************
 * Ver:2
 * branch: feat-action-integlation
 * 
 * NOTE: update
 * - `Collect`不要にした
 * 
 * ******************************************************************/ 
import type puppeteer from 'puppeteer';
import type { Navigation } from './Navigation';
// import type { Collect, iFilterLogic } from './Collect';

export type iResponsesResolveCallback<T> = (responses: (puppeteer.HTTPResponse | any)[], params?: any) => T[] | Promise<T[]>;

// NOTE: Not then handler. then handler returns below type function.
export type iAssemblerNavigationProcess<T> = (this: AssembleParallelPageSequences<T>, circulator: number) => Promise<(puppeteer.HTTPResponse | any)[]>;
export type iAssemblerResolveProcess<T> = (
    this: AssembleParallelPageSequences<T>, 
    circulator: number,
    responses: (puppeteer.HTTPResponse | any)[],
    param?: any) => Promise<T[]>;
export type iAssemblerSolutionProcess<T> = (
    this: AssembleParallelPageSequences<T>, 
    circulator: number, 
    resolved: T[]) => Promise<any> | any;
export type iAssemblerErrorHandlingProcess = (e: Error, circulator: number) => void;

// NOTE: Action wrapper
export type iAssemblerActionClosure<T> = (data: T) => Promise<any> | any;


export class AssembleParallelPageSequences<T> {
    public sequences: Promise<void>[] = [];
    private pageInstances: puppeteer.Page[] = [];
    private collected: T[];
    private collectedProperties: T[keyof T][];
    // NOTE: 初期化する必要があるから仕方なくundefinedの可能性をつけている
    // private responsesResolver: iResponsesResolveCallback<T> | undefined;
    // private navigationProcess: iAssemblerNavigationProcess<T> | undefined;
    private resolveProcess: iAssemblerResolveProcess<T> | undefined;
    private solutionProcess: iAssemblerSolutionProcess<T> | undefined;
    private errorHandlingProcess: iAssemblerErrorHandlingProcess | undefined;
    // NOTE: New added. 12/18 trigger内容をラップした同期関数であること
    private navigationTrigger: ((page: puppeteer.Page) => Promise<any>) | undefined;
    // NOTE: action
    private action: iAssemblerActionClosure<T> | undefined;
    constructor(
        private browser: puppeteer.Browser, 
        private concurrency: number,
        public navigation: Navigation,
        // private collector: Collect<T>
    ){
        this.collected = [];
        this.collectedProperties = [];
        this.resolveProcess = undefined;
        this.solutionProcess = undefined;
        this.errorHandlingProcess = undefined;
        this.navigationTrigger = undefined;
        // Methods binding. 
        // NOTE: bind()は元の関数の関数の型をanyにしてしまうとのこと...
        // https://typescript-jp.gitbook.io/deep-dive/main-1/bind
        // しかし型推論をみるにそんなことはないんだけどね
        this._generatePageInstances = this._generatePageInstances.bind(this);
        this._initializeSequences = this._initializeSequences.bind(this);
        this.initialize = this.initialize.bind(this);
        this.getPageInstance = this.getPageInstance.bind(this);
        this.getSequences = this.getSequences.bind(this);
        this.setResponseFilter = this.setResponseFilter.bind(this);
        this.run = this.run.bind(this);
        this.getCollected = this.getCollected.bind(this);
        this.getCollectedProperties = this.getCollectedProperties.bind(this);
        this.errorHandler = this.errorHandler.bind(this);
        this.finally = this.finally.bind(this);
        // 
        // NOTE: new added
        // 
        this.setupSequence = this.setupSequence.bind(this);
        this.setResolvingProcess = this.setResolvingProcess.bind(this);
        this.setSolutionProcess = this.setSolutionProcess.bind(this);
        this.setErrorHandlingProcess = this.setErrorHandlingProcess.bind(this);
        this.action = undefined;
        this.setAction = this.setAction.bind(this);
        this.executeAction = this.executeAction.bind(this);
        this.pushCollectingData = this.pushCollectingData.bind(this);
        this.pushCollectingProperty = this.pushCollectingProperty.bind(this);
        
        // this.responsesResolver = undefined;
        // this.navigationProcess = undefined;
        // this.setNavigationProcess = this.setNavigationProcess.bind(this);
        // this.resolveResponses = this.resolveResponses.bind(this);
        // this.setResponsesResolver = this.setResponsesResolver.bind(this);
        // this.collect = this.collect.bind(this);
        // this.collectProperties = this.collectProperties.bind(this);
        // this.filter = this.filter.bind(this);

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
     * 
     * sequenceNumberイランカモ...
     * */ 
    errorHandler(e: Error, sequenceNumber?: number) {
        // DEBUG:
        console.error(`Error: @setupParallelSequence::run().catch()`);

        const message: string = e.message + '' 
            + (sequenceNumber === undefined ? "" : sequenceNumber);
        console.error(message);
        
        // DEBUG: Shoot screen shot when got error.
        if(sequenceNumber !== undefined 
            && this.getPageInstance(sequenceNumber) !== undefined)
                this.getPageInstance(sequenceNumber)!.screenshot({type: "png", path: `./dist/assemblerErrorHandlerInSequence-${sequenceNumber}.png`})
        
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

    /***
     * Set up single task of sequence.
     * @param { number } index - Iterator of this.sequences
     * 
     * TODO: pageインスタンスには正しくアクセスできているのか？
     * */ 
    setupSequence(index: number) {
		if(this.getSequences()[index] === undefined 
            || this.getPageInstance(index) === undefined
        ) throw new Error("ReangeError: index accessing out of range of getSequences()");
		
        if(
            this.navigationTrigger === undefined
            || this.resolveProcess === undefined
            || this.solutionProcess === undefined
            || this.errorHandlingProcess === undefined
        ) throw new Error("Error: Process methods may not setup yet.");
        
        this.getSequences()[index] = this.getSequences()[index]!
        .then(() => this.navigationProcess!(index))
        .then((responses: (puppeteer.HTTPResponse|any)[]) => this.resolveProcess!(index, responses))
        .then((resolved: T[]) => this.solutionProcess!(index, resolved))
        .catch(e => this.errorHandler(e, index));
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

    // NOTE: New added. 12/18
    setNavigationTrigger(trigger: (page: puppeteer.Page) => Promise<any>): void {
        this.navigationTrigger = trigger;
    };

    // NOTE: New added. 12/18
    navigationProcess(circulator: number): Promise<(puppeteer.HTTPResponse | any)[]> {
        // DEBUG:
        console.log(`${circulator} navigationProcess():`);
        console.log(this.getPageInstance(circulator)!);

        return this.navigation.navigateBy(
            this.getPageInstance(circulator)!,
            this.navigationTrigger!(this.getPageInstance(circulator)!)
        );
    };

    // NOTE: action
    setAction(action: iAssemblerActionClosure<T>): void {
        this.action = action;
    };
    executeAction(data: T): Promise<any> | any {
        if(this.action !== undefined) return this.action(data);
    };

    // NOTE: Added instead of this.collector
    pushCollectingData(data: T): void {
        this.collected.push(data);
    };
    pushCollectingProperty(prop: T[keyof T]): void {
        this.collectedProperties.push(prop);
    }

    // --- LEGACY ---

    // 代わりにsetNavigationTrigger()を追加した。
	// setNavigationProcess(navigationProcess: iAssemblerNavigationProcess<T>) {
	// 	this.navigationProcess = navigationProcess.bind(this);
	// };

    
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

    
    // /***
    //  * Collect properties from data by specifying key which is keyof T.
    //  * */ 
    // collectProperties(data: T[], key: keyof T): void {
    //     this.collector.setData(data);
    //     if(key !== undefined) {
    //         this.collectedProperties = [...this.collectedProperties, ...this.collector.collectProperties(key)];
    //     }
    // };

    // /***
    //  * 
    //  * なんだか意味のないことをしているなぁ
    //  * NOTE: Nothing returns.
    //  * */ 
    // collect(data: T[]): void {
    //     this.collector.setData(data);
    //     this.collected = [...this.collected, ...this.collector.getData()];
    // }

    // /***
    //  * @param {T[]} data - 
    //  * @param {keyof T} key - The property name of data parameter.
    //  * @param {iFilterLogic} filterLogic - Filter logic that is required by Collect.filter().
    //  * 
    //  * T: {id: number, name: string, age: number}
    //  * data: [
    //  *  {id: 123, name: "Jango", age: 25},
    //  *  {id: 456, name: "Junko", age: 24},
    //  *  {id: 789, name: "Jaguar", age: 23},
    //  *  ...
    //  * ]
    //  * key: 'id'
    //  * filterLogic:
    //  * */ 
    // filter(data: T[], filterLogic: iFilterLogic<T>): T[] {
    //     this.collector.setData(data);
    //     return this.collector.filter(filterLogic);
    // };
};