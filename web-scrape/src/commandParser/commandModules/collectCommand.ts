import type yargs from 'yargs';

type iCommandBuild<T> = {
    [Property in keyof T]: yargs.Options;
};

export interface iCollectOptions {
    keyword: string;
    tags?: string[];
    bookmarkOver?: number;
    userName?: string;
};


const optionList = ["keyword", "bookmarkOver", "tag", "author"];

const command = "collect";
const description = "collect <command>";
const builder: iCommandBuild<iCollectOptions> = {
    keyword: {
        describe: "",
        demandOption: true,
        type: 'string'
    },
    bookmarkOver: {
        describe: "Specify artwork number of Bookmark",
        demandOption: false,
        type: "number"
    },
    tags: {
        describe: "Specify tag name must be included",
        demandOption: false,
        type: "string"
    },
    userName: {
        describe: "Specify author user name must be included",
        demandOption: false,
        type: "string"
    }
};
const wrapHandler = (options: {[key: string]: any}) => {
    return <T extends {[key: string]: yargs.Options}>(
        args: yargs.ArgumentsCamelCase<yargs.InferredOptionTypes<T>>
        ): void => {

        Object.keys(args).forEach(key=> {
            if(optionList.includes(key)) options[key] = args[key];
        });
        
        //  DEBUG:
        console.log("collect command handler");
        console.log(args);
        console.log(options);
    };
};

export const collectCommand = {
    command: command, 
    description: description,
    builder: builder,
    handlerWrapper: wrapHandler
};