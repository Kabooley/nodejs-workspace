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
const requiredForReposen = ["error", "message", "body"];
const requiredForBody = ["illustId", "illustTitle", "urls", "pageCount"];
/****
 * objのなかにrequirementのすべてのプロパティがあるときに
 * requirementのプロパティからなるオブジェクトを返す
 *
 *
 * */
const hasProperties = (obj, keys) => {
    let result = true;
    keys.forEach((key) => {
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
const takeOutPropertyFrom = (obj, keys) => {
    let o = {};
    keys.forEach((key) => {
        o[key] = obj[key];
    });
    return o;
};
/***
 * `obj`からkeysのプロパティだけを取り出したオブジェクトTを生成する。
 *
 *
 * */
const takeOutPropertyFromVer2 = (obj, keys) => {
    let o = {};
    keys.forEach((key) => {
        o[key] = obj[key];
    });
    return o;
};
/***
 * keyで指定したプロパティをobj取り出す
 *
 * */
const retrieveFrom = (obj, keys) => {
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
    // 指定のプロパティがdummyにあるのかチェックする
    if (hasProperties(dummy, requiredForReposen)) {
        // 指定のプロパティが存在するので各プロパティをそれぞれ取り出す
        // retirieved: (string | boolean | iArtwork)[]
        // 
        // この方法だとどれがiArtwork型の要素なのか後で探すのが大変
        const retrieved = requiredForReposen.map((key) => {
            return dummy[key];
        });
        // 一方、こっちの方法ならkeyを指定すればどの値が得られるかあとから容易にわかる
        const retrieved2 = takeOutPropertyFromVer2(dummy, requiredForReposen);
        console.log(retrieved);
        console.log(retrieved2);
        console.log(retrieved2.body); // iArtworkData型であることをTypeScriptが理解している
        if (hasProperties(retrieved2.body, requiredForBody)) {
            const ordered = takeOutPropertyFromVer2(retrieved2.body, requiredForBody);
            console.log(ordered);
        }
    }
})(dummy);
