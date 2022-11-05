/************************************************************
 * 
 * Implememt Command Interpreter 
 * **********************************************************/ 
import { orders } from './commandModules/index';

interface iOrders {
    commands: string[];
    options: object;
};


const setupTaskQueue = (orders: iOrders) => {
    const { commands, options } = orders;
    switch(commands.join()) {
        case 'collectbyKeyword':
            break;
        default:
    }
}