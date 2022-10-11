/************************************************************
 * Utilities for modifying Objects.
 * 
 * **********************************************************/ 
/****
 * 
 * 
 * */  
export const hasProperties = < T extends object>(obj: T, keys: (keyof T)[]): boolean => {
    let result: boolean = true;
    keys.forEach((key: keyof T) => {
        result = result && obj.hasOwnProperty(key);
    });
    return result;
 };
 
 
/***
 * ジェネリック型のオブジェクト`obj`から、keysのプロパティからなるオブジェクトを生成する。
 * プロパティを取り出すわけではないことに注意。
 * 
 * @type {T extends object} - オブジェクトだけを受け付けるのでジェネリックで指定できるT型はオブジェクトでなくてはならない
 * @param {T} obj
 * @param {(keyof T)[]} keys - key string of T type object that about to retrieve.
 * 
 * NOTE: そのプロパティが存在することを前提としている
 * */  
export const takeOutPropertiesFrom = < T extends object>(obj: T, keys: (keyof T)[]): T => {
    let o: T = <T>{};
    keys.forEach((key: keyof T) => {
        o[key] = obj[key];
    });
    return o;
 };

 
 //  /***
 //  * `obj`から`keys`で指定されたプロパティを取り出して、
 //  * その指定プロパティからなるオブジェクトを返す。
 //  * 
 //  * NOTE: 戻り値の型が`Record<keyof T, T[keyof T]>`になってその後戻り値の扱いに困るかも...
 //  * */  
 // const takeOutPropertyFrom = < T extends object>(obj: T, keys: (keyof T)[]): Record<keyof T, T[keyof T]> => {
 //     let o: Record<keyof T, T[keyof T]> = {} as Record<keyof T, T[keyof T]>;
 //     keys.forEach((key: keyof T) => {
 //         o[key] = obj[key];
 //     });
 //     return o;
 //  };


/* USAGE

// dummyにそのプロパティが存在するのかのチェックを行いながら、
// dummyから最終的にdummy.bodyのなかのプロパティを取り出す。

interface iBodyOfArtworkPageResponse {
    error: boolean;
    message:string;
    body: iArtworkData;
};

interface iArtworkData {
    illustId: string;
    illustTitle: string;
    illustComment?: string;
    id?: string;	// コメントした人
    title?: string;
    description?: string;
    illustType: number;		// 普通のイラストならたぶん０、gifとかだと0じゃない
    createDate?:string;
    uploadDate?:string;
    restrict?:number;
    xRestrict?:number;
    sl:string;
    urls:{
        mini?:string;   
        thumb?:string;  
        small?:string;  
        regular?:string;
        original:string;
    },
    tags?: any;
    pageCount: number;
};
 
const dummy: iBodyOfArtworkPageResponse = {
    error: false,
    message: "",
    body: {
        illustId: "12345",
        illustTitle: "title of this artwork",
        illustType: 0,
        sl:"",
        urls:{
            original:"",
        },
        pageCount: 3
    }
 };

 const requiredForReposen: (keyof iBodyOfArtworkPageResponse)[] = ["error", "message", "body"];
 const requiredForBody: (keyof iArtworkData)[] = ["illustId", "illustTitle", "urls", "pageCount"];


(function(dummy) {
    // 指定のプロパティがdummyにあるのかチェックする
    if(hasProperties<iBodyOfArtworkPageResponse>(dummy, requiredForReposen)){
        // 指定のプロパティが存在するので各プロパティをそれぞれ取り出す
        // retirieved: (string | boolean | iArtwork)[]
        // 
        // この方法だとどれがiArtwork型の要素なのか後で探すのが大変
        const retrieved = requiredForReposen.map((key: keyof iBodyOfArtworkPageResponse) => {
            return dummy[key];
        });

        // 一方、こっちの方法ならkeyを指定すればどの値が得られるかあとから容易にわかる
        const retrieved2 = takeOutPropertyFromVer2<iBodyOfArtworkPageResponse>(dummy, requiredForReposen);

        console.log(retrieved);
        console.log(retrieved2);
        console.log(retrieved2.body);   // iArtworkData型であることをTypeScriptが理解している

        if(hasProperties<iArtworkData>(retrieved2.body, requiredForBody)){
            const ordered = takeOutPropertyFromVer2<iArtworkData>(retrieved2.body, requiredForBody);
            console.log(ordered);
        }

    }
})(dummy); 

*/

