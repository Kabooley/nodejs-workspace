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

 const requiredForReposen: (keyof iBodyOfArtworkPageResponse)[] = ["body"];
 const requiredForBody: (keyof iArtworkData)[] = ["illustId", "illustTitle", "illustType", "sl", "urls", "pageCount"];

/****
 * objのなかにrequirementのすべてのプロパティがあるときに
 * requirementのプロパティからなるオブジェクトを返す
 * 
 * 
 * */  
 const hasOwnProperties = < T extends object>(obj: T, requirement: (keyof T)[]) => {
    let result: boolean = true;
    requirement.forEach((key: keyof T) => {
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
 const retrievePropertyBy = < T extends object>(obj: T, keys: (keyof T)[]): Record<keyof T, T[keyof T]> => {
    let o: Record<keyof T, T[keyof T]> = {} as Record<keyof T, T[keyof T]>;
    keys.forEach((key: keyof T) => {
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
 const retrievePropertyByVer2 = < T extends object>(obj: T, keys: (keyof T)[]): T => {
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
    if(hasOwnProperties<iBodyOfArtworkPageResponse>(dummy, requiredForReposen)){
        const dum: iBodyOfArtworkPageResponse = retrievePropertyByVer2<iBodyOfArtworkPageResponse>(dummy, requiredForReposen);

        console.log(dum);

        const body: iBodyOfArtworkPageResponse = retrievePropertyByVer2<iBodyOfArtworkPageResponse>(dummy, ["body"]);

        console.log(body);
    }
})(dummy); 