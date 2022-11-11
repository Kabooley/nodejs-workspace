/*************************************************************
 * Annotatins of result page HTTPResponse body data.
 * 
 * 
 * ***********************************************************/ 
export interface iIllustMangaDataElement {
    id: string;
    title: string;
    illustType?: number;
    xRestrict?: number;
    restrict?: number;
    sl?: number;
    url?: string;
    description?: string;
    tags?: any[];
    userId?: string;
    userName?: string;
    width?: number;
    height?: number;
    pageCount?: number;
    isBookmarkable?: boolean;
    bookmarkData?: any;
    alt?: string;
    titleCaptionTranslation?: any[];
    createDate?: string;
    updateDate?: string;
    isUnlisted?: boolean;
    isMasked?: boolean;
    profileImageUrl?: string;
};

export interface iIllustManga {
    data: iIllustMangaDataElement[],
    total: number
};

export interface iBodyIncludesIllustManga {
    error: boolean;
    body: {
        illustManga: iIllustManga;
    }
};
