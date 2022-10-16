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


// これはうまくいくけどまだほしい方になっていない
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


{

    type iBuilderBase<T> = {
        [key in keyof T]: {
            describe: string;
            demandOption: boolean;
            type: string;
        }
    };
    
}