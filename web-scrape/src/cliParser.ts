/**********************************************
 * Command Line Parser
 * 
 * Command modules for login and keyword
 * ********************************************/ 
export interface iCollectCommand {
    username: {
        describe: string;
        demandOption: boolean;
        type: "string";
      };
    //   Login Password
      password: {
        describe: string;
        demandOption: boolean;
        type: "string";
      };
    //   Search keyword
      keyword: {
        describe: string;
        demandOption: boolean;
        type: "string";
      };
      // 
      // bookmark: {
      //   describe: string,
      //   demandOption: false,
      //   type: string
      // }
};
export const commandName = "collect-image";
export const commandDesc = "Collects images which matches with specified keyword";
export const builder: iCollectCommand = {
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
  // bookmark: {
  //   describe: "Bookmark if it fulfills requirement",
  //   demandOption: false,
  //   type: "string"
  // }
};


// --- USAGE ---
// 
// const commands: iCommand = {};
// // 
// // -- COMMAND MANAGER --
// // 
// yargs(process.argv.slice(2)).command(commandName, commandDesc, 
//   {...builder},   // {...builder}とするのと、builderに一致するinterfaceが必須となっている...
//   (args) => {
//       console.log(`username: ${args.username}. password: ${args.password}. keyword: ${args.keyword}`);
//       commands['username'] =args.username;
//       commands['password'] =args.password;
//       commands['keyword'] =args.keyword;
//       escapedKeyword = encodeURIComponent(args.keyword!);
//       console.log(commands);
// }).argv;
// const {username, password, keyword} = commands;
// if(!username || !password || !keyword) throw new Error("command option is required");