/*******************************************************
 * Interfaces for HTTPResponse body data from artwork page.
 * 
 * iMetaPreloadData > iIllust > iIllustData
 * *****************************************************/ 

export interface iMetaPreloadData {
    timestamp: string;
    illust: iIllust;
};

export interface iIllust {
    // property key is artwork id.
    // Like this: {17263: iIllustData} 
    [key: string]: iIllustData;
};

export interface iIllustData {
    illustId:string;
    illustTitle: string;
    illustComment: string;
    id: string;
    title: string;
    description: string;
    illustType: number;
    createDate: string;
    uploadDate: string;
    sl: number;
    urls: {
        mini: string;
        thumb: string;
        small: string;
        regular: string;
        original: string;
    },
    tags: {};
    pageCount: number;
    bookmarkCount: number;
    likeCount:number;
};

