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

interface iArgv {
    username: string;
    password: string;
    keyword: string;
}

const argv = yargs(process.argv.slice(2));
const command: iCommand = {};

argv.command<iArgv>({
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
    handler: function <iArgv>(argv) {
      command['username'] = argv.username;
      command['password'] = argv.password;
      command['keyword'] = argv.keyword
        ? argv.keyword
        : constants.searchKeyword.ExclusiveTwoB;
    },
  
})