import type yargs from 'yargs';

const collectOptionList = ["username", "password", "keyword"];

export interface iCollectOptions {
    username: string;
    password: string;
    keyword: string;
};

type iCommandBuild<T> = {
    [Property in keyof T]: yargs.Options;
};

const command = "collect-image";
const description = "Collects images which matches with specified keyword";
const builder: iCommandBuild<iCollectOptions> = {
    // Login ID
  username: {
    describe: "username",
    demandOption: true,
    type: "string",
  },
//   Login Password
  password: {
    describe: "password",
    demandOption: true,
    type: "string",
  },
//   Search keyword
  keyword: {
    describe: "keyword",
    demandOption: false,
    type: "string",
  }
};

/***
 * @param {{[key: string]: any}} options - Object that its command option value will be contained.
 * @return function that will be used as Yargs.command().handler().
 * */ 
const wrapHandler = (options: {[key: string]: any}) => {
    return <T extends {[key: string]: yargs.Options}>(
        args: yargs.ArgumentsCamelCase<yargs.InferredOptionTypes<T>>
        ): void => {
            // 
            // DEBUG:
            // 
            console.log(args);

        Object.keys(args).forEach(key=> {
            if(collectOptionList.includes(key)) options[key] = args[key];
        })
    };
};

export const collectCommand = {
    command: command, 
    description: description,
    builder: builder,
    handlerWrapper: wrapHandler
};