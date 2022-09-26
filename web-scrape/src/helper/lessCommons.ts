/**********************************************************
 * 使用場面が限られたメソッドをここにあつめる。
 * 
 * ********************************************************/ 
import type puppeteer from "puppeteer";

/****
 * Collect.navigateBy()から返されるHTTPResponse他からなる配列から、
 * 最初の要素のHTTPResponseをjson()して返す。
 * 
 * 
 * */ 
export const getFirstElementToJson = async <T>(arr: puppeteer.HTTPResponse[]):Promise<T> => {
    if(!arr || !arr[0]) throw new Error("Somethign went wrong. HTTP Response was empty");

    return await arr[0].json();
};
