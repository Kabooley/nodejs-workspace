/***********************************************************
 * オブジェクトに指定のプロパティが含まれているのか調査する機能
 * 
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


const hasOwnProperty = <T extends object>(obj: T, key: keyof T): boolean => {
    return obj.hasOwnProperty(key);
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
 
 let result = true;
 const requiredForReposen: (keyof iBodyOfArtworkPageResponse)[] = ["body"];
 const requiredForBody: (keyof iArtworkData)[] = ["illustId", "illustTitle", "illustType", "sl", "urls", "pageCount"];

 if(dummy) {
    // // for...inだとpropに型注釈をつけられない
    // // なのでpropの型が重要な場面では使えない
    // for(const prop in requiredForReposen) {
    //     // この比較なら一つでもfalseが返されれば必ずresultはfalseになる
    //     prop as keyof iBodyOfArtworkPageResponse;
    //     result = result && hasOwnProperty<iBodyOfArtworkPageResponse>(dummy, prop);
    // }

    requiredForReposen.forEach((key: keyof iBodyOfArtworkPageResponse) => {
        result = result && hasOwnProperty<iBodyOfArtworkPageResponse>(dummy, key);
    });

    // --- ここら辺が囲えそう-------------
    if(result) {
        const body = dummy!.body;
        requiredForBody.forEach((key: keyof iArtworkData) => {
            result = result && hasOwnProperty<iArtworkData>(body, key);
        });
    }

    if(result) {
        let contents = {};
        requiredForBody.forEach((key) => {
            contents[key] = dummy.body[key];
        });
        return contents;
    }
    // -----------------------------------
 };

/****
 * objのなかにrequirementのすべてのプロパティがあるときに
 * requirementのプロパティからなるオブジェクトを返す
 * 
 * 
 * */  
 const _hasOwnProperty = < T extends object>(obj: T, requirement: (keyof T)[]) => {
    // 1. Check whether obj satisfies properties that required by requirement.
    let result: boolean = true;
    requirement.forEach((key: keyof T) => {
        result = result && obj.hasOwnProperty(key);
    });
    // 2. return object satisfies properties that requirement requires.
    if(result) {
        // TODO: {requirement key: obj[requirement]}を返すようにする
    }
 }  