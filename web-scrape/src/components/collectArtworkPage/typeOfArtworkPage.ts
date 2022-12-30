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


/***
 * 利用するにあたって無視していいプロパティに対してオプショナルにしている。
 * 
 * */ 
export interface iIllustData {
    illustId: string;
    illustTitle: string;
    illustComment?: string;
    id: string;
    title: string;
    description?: string;
    illustType: number;
    // Date data
    createDate?: string;
    uploadDate?: string;

    restrict?: number;
    xRestrict?: number;
    sl: number;
    urls: {
      mini: string;
      thumb: string;
      small: string;
      regular: string;
      original: string;
    },
    tags: {
      authorId?: string;
      isLocked?: boolean;
      tags: {
        authorId?: string;
        isLocked: boolean;
        tags: iTags[];
        writable?: boolean;
      };
      writable?: boolean;
    },
    alt?: string;
    storableTags?: string[];
    userId?: string;
    userName: string;
    userAccount?: string;
    userIllusts?: any;
    likeData: boolean;
    width?: number;
    height?: number;
    pageCount: number;
    bookmarkCount: number;
    likeCount: number;
    commentCount?: number;
    responseCount?: number;
    viewCount: number;
    bookStyle: number;
    isHowto?: boolean;
    isOriginal?: boolean;
    imageResponseOutData?: [],
    imageResponseData?: [],
    imageResponseCount?: number;
    pollData?: any;
    seriesNavData?: any;
    descriptionBoothId?: any;
    descriptionYoutubeId?: any;
    comicPromotion?: any;
    fanboxPromotion?: any;
    contestBanners?: any[],
    isBookmarkable?: true,
    bookmarkData?: any;
    contestData?: any;
    zoneConfig?: any;
    extraData?: any;
    titleCaptionTranslation?: any;
    isUnlisted?: boolean;
    request?: any;
    commentOff?: number;
    aiType?: number;
};

export interface iTags {
    tag: string;
    locked?: boolean;
    deletable?: boolean;
    userId?: string;
    userName?: string;
};



// export interface iIllustData {
//     illustId:string;
//     illustTitle: string;
//     illustComment: string;
//     id: string;
//     title: string;
//     description: string;
//     illustType: number;
//     createDate: string;
//     uploadDate: string;
//     sl: number;
//     urls: {
//         mini: string;
//         thumb: string;
//         small: string;
//         regular: string;
//         original: string;
//     },
//     tags: {};
//     pageCount: number;
//     bookmarkCount: number;
//     likeCount:number;
// };