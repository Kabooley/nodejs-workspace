/***********************************************
 * NEW COMMAND: "bookmark"
 * 
 * LIKE THIS.
 * ```bash
 * $ node index.ts bookmark \
 *  --amountOfBookmarkOver=5000 \
 *  --tag=COWBOYBEBOP \
 *  --author=awesomeCreator \
 * ```
 * 
 * TODO:
 * .commandならオプションのコマンドなのか？
 * .demancCommandなら必須コマンドなのか？
 * 
 * *********************************************/ 
 import type yargs from 'yargs';
 import Yargs from 'yargs/yargs';

 {
    interface iBookmarkOptions {
        bookmarkOver?: string;
        tag?: string;
        author?: string;
    };
    type iCommandBuild<T> = {
        [Property in keyof T]: yargs.Options;
    };
    
    const bookmarkCommandBuilder: iCommandBuild<iBookmarkOptions> = {
        bookmarkOver: {
            describe: "Specify artwork number of Bookmark",
            demandOption: false,
            type: "number"
        },
        tag: {
            describe: "Specify tag name must be included",
            demandOption: false,
            type: "string"
        },
        author: {
            describe: "Specify author name that msut be included",
            demandOption: false,
            type: "string"
        }
    };

    let bookmarkCommandValues = {} as iBookmarkOptions;

    /****
     * args: {
     *  bookmarkOver: 1000, 
     *  tag: "awesome",
     *  author: "Franz"
     * }
     * 
     * 
     * */ 
    // const bookmarkCommandHandler = <O extends {[key: string]: yargs.Options}>(args: yargs.ArgumentsCamelCase<yargs.InferredOptionTypes<O>>): void => {
    //     // retrieves option value into another object.
    //     Object.keys(args).forEach(key=> {
    //         bookmarkCommandValues[key] = args[key]
    //     })
    // }
    const bookmarkCommandHandler = (args: yargs.ArgumentsCamelCase<yargs.InferredOptionTypes<iCommandBuild<iBookmarkOptions>>>): void => {
        // retrieves option value into another object.
        Object.keys(args).forEach(key=> {
            bookmarkCommandValues[key] = args[key]
        })
    }

    Yargs(process.argv.splice(2))
    .command<iCommandBuild<iBookmarkOptions>>(
        "bookmark",
        "Specified, bookmark artwork if it fulfills specific requirement.",
        bookmarkCommandBuilder,
        bookmarkCommandHandler
    );
 }
 
 
 // これでもいいけど、
 // だったらiCommandBookmarkBuildをbookmarkCommandBuilderへ直接渡した方が早い
 {
 
     interface iCommandBookmarkBuild {
         bookmarkOver?: {
             describe:string;
             demandOption: boolean;
             type: string;
         },
         tag?: {
             describe:string;
             demandOption: boolean;
             type: string;
         },
         author?: {
             describe:string;
             demandOption: boolean;
             type: string;
         }
     };
     type interrepted<T> = { [key in keyof T]: T[key]};
     const bookmarkCommandBuilder: interrepted<iCommandBookmarkBuild> = {
         bookmarkOver: {
             describe: "Specify artwork number of Bookmark",
             demandOption: false,
             type: "number"
         },
         tag: {
             describe: "Specify tag name must be included",
             demandOption: false,
             type: "string"
         },
         author: {
             describe: "Specify author name that msut be included",
             demandOption: false,
             type: "string"
         }
     };
 
     const argv = Yargs(process.argv.splice(2));
 
     const bookmarkCommandHandler = (args: yargs.ArgumentsCamelCase<iCommandBookmarkBuild>) => {
         return {
             bookmarkOver: args.bookmarOver === undefined ? undefined : args.bookmarkOver,
             tag: args.tag === undefined ? undefined : args.tag,
             author: args.author === undefined ? undefined : args.author
         }
     }
     
     const bookmarkCommand = argv
         .command(
             "bookmark", 
             "Specified, bookmark artwork if it fulfills specific requirement.",
             {...bookmarkCommandBuilder},
             bookmarkCommandHandler
         ).argv;
     
 }
 
 
//  原始時代に戻った感...
// 
// この場合だとbookmarkCommandBuilderのプロパティ名を好き勝手につけることを許してしまう
 {
    // const bookmarkKeyTemplate: string[] = ["bookmarkOver", "tag", "author"];
    const bookmarkKeyTemplate = {
        bookmarkOver: "bookmarkOver",
        tag: "tag",
        author: "author"
    } as const;

    type iCommandProp = {
        describe: string;
        demandOption: boolean;
        type: string;
    };

    type iCommandBuild = {
        [key: string]: iCommandProp;
    };

    const bookmarkCommandBuilder: iCommandBuild = {
        bookmarkOver: {
            describe: "Specify artwork number of Bookmark",
            demandOption: false,
            type: "number"
        },
        tag: {
            describe: "Specify tag name must be included",
            demandOption: false,
            type: "string"
        },
        author: {
            describe: "Specify author name that msut be included",
            demandOption: false,
            type: "string"
        },
        // 誤ったキー
        incorrectKey: {
            describe: "Specify author name that msut be included",
            demandOption: false,
            type: "string"
        }
    };
 }

// この場合、毎度bookmarkKeyTemplateのような
// めんどくさい意味のないオブジェクトを作らなくてはならなくなる
 {
    const bookmarkKeyTemplate = {
        bookmarkOver: "bookmarkOver",
        tag: "tag",
        author: "author"
    } as const;

    type iCommandProp = {
        describe: string;
        demandOption: boolean;
        type: string;
    };

    type iCommandBuild<T> = {
        [key in keyof T]: iCommandProp;
    };

    const bookmarkCommandBuilder: iCommandBuild<typeof bookmarkKeyTemplate> = {
        bookmarkOver: {
            describe: "Specify artwork number of Bookmark",
            demandOption: false,
            type: "number"
        },
        tag: {
            describe: "Specify tag name must be included",
            demandOption: false,
            type: "string"
        },
        author: {
            describe: "Specify author name that msut be included",
            demandOption: false,
            type: "string"
        },
        // 誤ったキーはちゃんとエラーになる
        // incorrectKey: {
        //     describe: "Specify author name that msut be included",
        //     demandOption: false,
        //     type: "string"
        // }
    };
 }

//  一番再利用性が高いかな....
 {
    const bookmarkCommandKeys = ["bookmarkOver", "tag", "author"] as const;
    // "bookmarkOver" | "tag" | "author"
    type iL = typeof bookmarkCommandKeys[number];

    type iCommandProp = {
        describe: string;
        demandOption: boolean;
        type: string;
    };

    // これならコマンドの配列を受け取ればkeyを制限することができる
    // Tは"string | symbol | number"型でないといけない
    // 例: typeof 文字列配列[number]
    type iCommandBuild<T extends string | symbol | number> = {
        [key in T]: iCommandProp;
    };

    const bookmarkCommandBuilder: iCommandBuild<iL> = {
        bookmarkOver: {
            describe: "Specify artwork number of Bookmark",
            demandOption: false,
            type: "number"
        },
        tag: {
            describe: "Specify tag name must be included",
            demandOption: false,
            type: "string"
        },
        author: {
            describe: "Specify author name that msut be included",
            demandOption: false,
            type: "string"
        },
        // 誤ったキーはちゃんとエラーになる
        // incorrectKey: {
        //     describe: "Specify author name that msut be included",
        //     demandOption: false,
        //     type: "string"
        // }
    };


 }

 {
    interface iBookmarkOptions {
        bookmarkOver: string;
        tag: string;
        author: string;
    }

    type iCommandProp = {
        describe: string;
        demandOption: boolean;
        type: string;
    };

    // これならコマンドの配列を受け取ればkeyを制限することができる
    // Tは"string | symbol | number"型でないといけない
    // 例: typeof 文字列配列[number]
    type iCommandBuild<T> = {
        [Property in keyof T]: iCommandProp;
    };

    const bookmarkCommandBuilder: iCommandBuild<iBookmarkOptions> = {
        bookmarkOver: {
            describe: "Specify artwork number of Bookmark",
            demandOption: false,
            type: "number"
        },
        tag: {
            describe: "Specify tag name must be included",
            demandOption: false,
            type: "string"
        },
        author: {
            describe: "Specify author name that msut be included",
            demandOption: false,
            type: "string"
        },
        // 誤ったキーはちゃんとエラーになる
        // incorrectKey: {
        //     describe: "Specify author name that msut be included",
        //     demandOption: false,
        //     type: "string"
        // }
    };

    const bookmarkCommandHandler = () => {

    }

    
    Yargs(process.argv.splice(2))
    .command(
        "bookmark",
        "Specified, bookmark artwork if it fulfills specific requirement.",
        {
            bookmarkOver: {
                describe: "Specify artwork number of Bookmark",
                demandOption: false,
                type: "number"
            },
            tag: {
                describe: "Specify tag name must be included",
                demandOption: false,
                type: "string"
            },
            author: {
                describe: "Specify author name that msut be included",
                demandOption: false,
                type: "string"
            }
        },
        bookmarkCommandHandler
    )
    .argv;


 }

