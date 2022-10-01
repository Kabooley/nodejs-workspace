/***********************************************************
 * オブジェクトに指定のプロパティが含まれているのか調査する機能
 * 
 * 
 * TODO: iBodyOfArtworkPageResponseからなるオブジェクトからiArtworkDataからなるオブジェクトを取り出すはずが、指定のプロパティからなるiBodyOfArtworkPageResponseオブジェクトを生成していただけだった。
 * 
 * なので取り出すロジックを作り直すこと。
 * *********************************************************/ 
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
        mini?:string;       // 実際はstringではなくて正規表現である
        thumb?:string;      // 実際はstringではなくて正規表現である
        small?:string;      // 実際はstringではなくて正規表現である
        regular?:string;    // 実際はstringではなくて正規表現である
        original:string;    // 実際はstringではなくて正規表現である。取得したい情報。
    },
    tags?: any;
    pageCount: number;		// 多分一枚目以外の画像枚数
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
            original:"",    // 実際はstringではなくて正規表現である。取得したい情報。
        },
        pageCount: 3	// 多分一枚目以外の画像枚数
    }
 };

 const requiredForReposen: (keyof iBodyOfArtworkPageResponse)[] = ["error", "message", "body"];
 const requiredForBody: (keyof iArtworkData)[] = ["illustId", "illustTitle", "urls", "pageCount"];

/****
 * objのなかにrequirementのすべてのプロパティがあるときに
 * requirementのプロパティからなるオブジェクトを返す
 * 
 * 
 * */  
 const hasProperties = < T extends object>(obj: T, keys: (keyof T)[]): boolean => {
    let result: boolean = true;
    keys.forEach((key: keyof T) => {
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
 const takeOutPropertyFrom = < T extends object>(obj: T, keys: (keyof T)[]): Record<keyof T, T[keyof T]> => {
    let o: Record<keyof T, T[keyof T]> = {} as Record<keyof T, T[keyof T]>;
    keys.forEach((key: keyof T) => {
        o[key] = obj[key];
    });
    return o;
 };

/***
 * `obj`からkeysのプロパティだけを取り出したオブジェクトTを生成する。
 * 
 * 
 * */  
 const takeOutPropertyFromVer2 = < T extends object>(obj: T, keys: (keyof T)[]): T => {
    let o: T = <T>{};
    keys.forEach((key: keyof T) => {
        o[key] = obj[key];
    });
    return o;
 };

/***
 * keyで指定したプロパティをobj取り出す
 * 
 * */  
 const retrieveFrom = < T extends object>(obj: T, keys: (keyof T)[]): T => {
    let o: T = <T>{};
    keys.forEach((key: keyof T) => {
        o[key] = obj[key];
    });
    return o;
 };

/***
 * dummyからそのプロパティbody以下を取り出す
 * 
 * 
 * */
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