/********************************************************
 * TEST: Collector.ts::_filter()のテスト
 * 
 * 
 * ******************************************************/ 
import { Collect } from './Collect';
import type { iFilterLogic } from './Collect';

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


const dummy: iIllustMangaDataElement[] = [
    {
        "id": "101393474",
        "title": "彼岸の庭渡久１２０６",
        "illustType": 1,
        "xRestrict": 0,
        "restrict": 0,
        "sl": 2,
        "url": "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/22/00/05/55/101393474_p0_square1200.jpg",
        "description": "",
        "tags": [
            "東方",
            "彼岸の庭渡様",
            "庭渡久侘歌",
            "豪徳寺ミケ",
            "少名針妙丸",
            "射命丸文",
            "リリーホワイト",
            "リリーブラック"
        ],
        "userId": "9824519",
        "userName": "人郷想幻（げんそうきょうじん）",
        "width": 287,
        "height": 821,
        "pageCount": 1,
        "isBookmarkable": true,
        "bookmarkData": null,
        "alt": "#東方 彼岸の庭渡久１２０６ - 人郷想幻（げんそうきょうじん）のマンガ",
        "createDate": "2022-09-22T00:05:55+09:00",
        "updateDate": "2022-09-22T00:05:55+09:00",
        "isUnlisted": false,
        "isMasked": false,
        "profileImageUrl": "https://i.pximg.net/user-profile/img/2022/06/17/10/08/33/22889909_0d5609f386476846aa404ad4c634e38f_50.jpg"
    },
    {
        "id": "101381167",
        "title": "落書き11",
        "illustType": 0,
        "xRestrict": 1,
        "restrict": 0,
        "sl": 6,
        "url": "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/21/12/18/49/101381167_p0_square1200.jpg",
        "description": "",
        "tags": [
            "R-18",
            "東方Project",
            "犬走椛",
            "射命丸文"
        ],
        "userId": "4472917",
        "userName": "kjo",
        "width": 960,
        "height": 1280,
        "pageCount": 20,
        "isBookmarkable": true,
        "bookmarkData": null,
        "alt": "#東方Project 落書き11 - kjoのイラスト",
        "createDate": "2022-09-21T12:18:49+09:00",
        "updateDate": "2022-09-21T12:18:49+09:00",
        "isUnlisted": false,
        "isMasked": false,
        "profileImageUrl": "https://i.pximg.net/user-profile/img/2020/02/22/02/55/14/17967117_9033a06b5f70d391c5cf66d4e248d847_50.jpg"
    },
    {
        "id": "101380663",
        "title": "東方二次小説（第13話）「アイドル天狗はたて」（2）～（7）",
        "illustType": 0,
        "xRestrict": 1,
        "restrict": 0,
        "sl": 6,
        "url": "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/21/11/33/07/101380663_p0_square1200.jpg",
        "description": "",
        "tags": [
            "R-18",
            "姫海棠はたて",
            "東方project",
            "射命丸文",
            "管牧典",
            "二ツ岩マミゾウ",
            "封獣ぬえ",
            "パンチラ"
        ],
        "userId": "52941975",
        "userName": "美少女帝国",
        "width": 1280,
        "height": 720,
        "pageCount": 6,
        "isBookmarkable": true,
        "bookmarkData": null,
        "alt": "#姫海棠はたて 東方二次小説（第13話）「アイドル天狗はたて」（2）～（7） - 美少女帝国のイラスト",
        "createDate": "2022-09-21T11:33:07+09:00",
        "updateDate": "2022-09-21T11:33:07+09:00",
        "isUnlisted": false,
        "isMasked": false,
        "profileImageUrl": "https://s.pximg.net/common/images/no_profile_s.png"
    }
];


/***
 * Array includes some element of another array.
 * 
 * ref: https://stackoverflow.com/a/39893636
 * 
 * @param {any[]} compare - この配列が
 * @param {any[]} to - この配列の要素を一つ以上含むのか
 * @return {boolean} - 一つ以上含むならtrue
 * */ 
 const includesAtLeast = (compare: any[], to: any[]): boolean => {
    return to.some(v => compare.includes(v));
};

/***
 * Array includes all element of another array.
 * 
 * ref: https://stackoverflow.com/a/53606357
 * 
 * @param {any[]} compare - この配列が
 * @param {any[]} to - この配列の要素をすべて含むのか
 * @return {boolean} - すべて含むならtrue
 * */ 
const includesAll = (compare: any[], to: any[]): boolean => {
    return to.every(v => compare.includes(v));
};

(async function() {
    const collector = new Collect<iIllustMangaDataElement>();

    const KEY: keyof iIllustMangaDataElement = "tags";

    const filterLogic: iFilterLogic<iIllustMangaDataElement> = (element) => {
        const property: keyof iIllustMangaDataElement = KEY;
        const requirement: string[] = ["射命丸文"];
        const e = element[property];
        if(e !== undefined) {
            return includesAll(e, requirement) ? element : undefined;
        }
    };

    collector.resetData(dummy);
    const filtered = collector.filter(filterLogic, "id");
    console.log(filtered);
})();