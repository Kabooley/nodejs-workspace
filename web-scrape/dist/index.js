"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = void 0;
var yargs_1 = __importDefault(require("yargs/yargs"));
var cliParser_1 = require("./cliParser");
exports.commands = {};
(0, yargs_1.default)(process.argv.slice(2)).command(cliParser_1.commandName, cliParser_1.commandDesc, __assign({}, cliParser_1.builder), // {...builder}とするのと、buidlerに一致するinterfaceが必須となっている...
function (args) {
    console.log("username: ".concat(args.username, ". password: ").concat(args.password, ". keyword: ").concat(args.keyword));
    exports.commands['username'] = args.username;
    exports.commands['password'] = args.password;
    exports.commands['keyword'] = args.keyword;
    console.log(exports.commands);
}).argv;
console.log(exports.commands);
