import type yargs from 'yargs';


export type iPartialOptions = Partial<iOptions>;

/**
 * Common options for every command.
 * */ 
export interface iOptions {
    bookmarkOver?: number;
    tags?: string[];
    userName?: string;
    keyword: string;
};

export type iCommandBuild<T> = {
    [Property in keyof T]: yargs.Options;
};

export type iCommands = "collect" | "bookmark" | "download";