# TypeScript Tips

TODO: TypeScriptの書籍を買え！

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