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

//  Record<>
 {
    const bookmarkCommandKeys = ["bookmarkOver", "tag", "author"] as const;
    // "bookmarkOver" | "tag" | "author"
    type iL = typeof bookmarkCommandKeys[number];

    type iCommandProp = {
        describe: string;
        demandOption: boolean;
        type: string;
    };

    // つまり[key in ~]の~にタプルを渡せればいい
    // そこを再利用可能にできればいいかも
    type iCommandBuild = {
        [key in iL]: iCommandProp;
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
        // 誤ったキーはちゃんとエラーになる
        // incorrectKey: {
        //     describe: "Specify author name that msut be included",
        //     demandOption: false,
        //     type: "string"
        // }
    };
 }

/*

*/  
