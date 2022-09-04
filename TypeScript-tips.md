# TypeScript Tips

TODO: TypeScriptの書籍を買え！

## yargs型付け

```TypeScript
// @types/yargs/index.d.ts
// yargs.command()

    interface CommandModule<T = {}, U = {}> {
        /** array of strings (or a single string) representing aliases of `exports.command`, positional args defined in an alias are ignored */
        aliases?: ReadonlyArray<string> | string | undefined;
        /** object declaring the options the command accepts, or a function accepting and returning a yargs instance */
        builder?: CommandBuilder<T, U> | undefined;
        /** string (or array of strings) that executes this command when given on the command line, first string may contain positional args */
        command?: ReadonlyArray<string> | string | undefined;
        /** boolean (or string) to show deprecation notice */
        deprecated?: boolean | string | undefined;
        /** string used as the description for the command in help text, use `false` for a hidden command */
        describe?: string | false | undefined;
        /** a function which will be passed the parsed argv. */
        handler: (args: ArgumentsCamelCase<U>) => void | Promise<void>;
    }

    /** Arguments type, with camelcased keys */
    type ArgumentsCamelCase<T = {}> = { [key in keyof T as key | CamelCaseKey<key>]: T[key] } & {
        /** Non-option arguments */
        _: Array<string | number>;
        /** The script name or node command */
        $0: string;
        /** All remaining options */
        [argName: string]: unknown;
    };

```

TODO: オブジェクトメソッドの型付け

## 後から動的にプロパティを追加するつもりの空のオブジェクト

https://bobbyhadz.com/blog/typescript-add-dynamic-property-to-object

```TypeScript
interface Person {
  [key: string]: any;
}

const obj: Person = {};

obj.name = 'Tom';
obj.age = 30;
```

実践してみたところ：

```TypeScript
/************************
 * Command Line Parser
 * 
 * Using yargs
 * 
 * Enable 
 * - Search keyword
 * - Avoiding hard-coding username and password. 
 * */ 
import yargs from 'yargs/yargs';

interface iCommand {
    [key: string]: string | number;
}

const argv = yargs(process.argv.slice(2));
const command: iCommand = {};

argv.command({
    command: "get-image",
    describe: "get image",
    builder: {
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
      },
    },
    handler: function (argv) {
      command.username = argv.username;
      command.password = argv.password;
      command.keyword = argv.keyword
        ? argv.keyword
        : constants.searchKeyword.ExclusiveTwoB;
    },
  
})
```