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
}