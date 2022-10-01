"use strict";
;
;
const dummy = {
    error: false,
    message: "",
    body: {
        illustId: "12345",
        illustTitle: "title of this artwork",
        illustType: 0,
        sl: "",
        urls: {
            original: "", // 実際はstringではなくて正規表現である。取得したい情報。
        },
        pageCount: 3 // 多分一枚目以外の画像枚数
    }
};
const requiredForReposen = ["body"];
const requiredForBody = ["illustId", "illustTitle", "illustType", "sl", "urls", "pageCount"];
/****
 * objのなかにrequirementのすべてのプロパティがあるときに
 * requirementのプロパティからなるオブジェクトを返す
 *
 *
 * */
const hasOwnProperties = (obj, requirement) => {
    let result = true;
    requirement.forEach((key) => {
        result = result && obj.hasOwnProperty(key);
    });
    return result;
};
/***
 * `obj`から`keys`で指定されたプロパティを取り出して、
 * その指定プロパティからなるオブジェクトを返す。
 *
 * NOTE: 戻り値の型が`Record<keyof T, T[keyof T]>`になってその後戻り値の扱いに困るかも...
 * */
const retrievePropertyBy = (obj, keys) => {
    let o = {};
    keys.forEach((key) => {
        o[key] = obj[key];
    });
    return o;
};
/***
 * `obj`から`keys`で指定されたプロパティを取り出して、
 * その指定プロパティからなるオブジェクトを返す。
 *
 *
 * */
const retrievePropertyByVer2 = (obj, keys) => {
    let o = {};
    keys.forEach((key) => {
        o[key] = obj[key];
    });
    return o;
};
/***
 * dummyからそのプロパティbody以下を取り出す
 *
 *
 * */
(function (dummy) {
    if (hasOwnProperties(dummy, requiredForReposen)) {
        const dum = retrievePropertyByVer2(dummy, requiredForReposen);
        console.log(dum);
        const body = retrievePropertyByVer2(dummy, ["body"]);
        console.log(body);
    }
})(dummy);
