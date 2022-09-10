/**********************************************
 * Validator for Object that have required schema.
 * 
 * For reference to:
 * https://stackoverflow.com/questions/38616612/javascript-elegant-way-to-check-object-has-required-properties
 * 
 * https://stackoverflow.com/questions/2631001/test-for-existence-of-nested-javascript-object-key
 * 
 * JSONオブジェクトが`iRequiredSearchResultData`を満たせばOK
 * ********************************************/ 

// NOTE: オブジェクトがネストされていないことが前提である
export const validator = (object: object, schema): void => {
    let errors: Error[] = Object.keys(schema).filter(function(key) {
        return !schema[key](object[key]);
    })
    .map(function(key) {
        return new Error("Invalid key:" + key);
    });

    if(errors.length) {
        errors.forEach(err => {
            console.error(err);
        });
        throw new Error("Caught invalid JSON object");
    }

    console.log("The JSON object is valid.");
} 


// Only requiring title and id.
interface iIllustMangaElement {
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
}

interface iRequiredSearchResultData {
    error:boolean;
    body: {
        illustManga: {
            data: iIllustMangaElement[];
            total: number;
            bookmarkRanges: any[];
        },
        popular?: any;
        relatedTags?: string[];
        tagTransition?: any;
        zoneConfig?: any
    }
};

const json: iRequiredSearchResultData = {
    error: false,
    body: {
    illustManga: {
    data: [
      {
        id: '101116741',
        title: 'ヨルハ二号B型',
        illustType: 2,
        xRestrict: 1,
        restrict: 0,
        sl: 6,
        url: 'https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/10/02/42/45/101116741_square1200.jpg',
        description: '',
        tags: [Array],
        userId: '51217862',
        userName: 'ｍａｅｎｃｈｕ',
        width: 1920,
        height: 1080,
        pageCount: 1,
        isBookmarkable: true,
        bookmarkData: null,
        alt: '#ヨルハ二号B型 ヨルハ二号B型 - ｍａｅｎｃｈｕのうごイラ',
        titleCaptionTranslation: [Object],
        createDate: '2022-09-10T02:42:45+09:00',
        updateDate: '2022-09-10T02:42:45+09:00',
        isUnlisted: false,
        isMasked: false,
        profileImageUrl: 'https://i.pximg.net/user-profile/img/2021/06/02/06/20/17/20804853_03f8430c57fac290a28bbb6cfc46d494_50.png'
      },
      {
        id: '101116378',
        title: '2B切腹',
        illustType: 0,
        xRestrict: 2,
        restrict: 0,
        sl: 6,
        url: 'https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2022/09/10/02/15/53/101116378_p0_custom1200.jpg',
        description: '',
        tags: [Array],
        userId: '17499879',
        userName: 'GZZ',
        width: 2200,
        height: 1800,
        pageCount: 1,
        isBookmarkable: true,
        bookmarkData: null,
        alt: '#ニーアオートマタ 2B切腹 - GZZのイラスト',
        titleCaptionTranslation: [Object],
        createDate: '2022-09-10T02:15:53+09:00',
        updateDate: '2022-09-10T02:15:53+09:00',
        isUnlisted: false,
        isMasked: false,
        profileImageUrl: 'https://i.pximg.net/user-profile/img/2021/03/08/14/58/29/20322662_4296802f6f008b2b7add96b2ac2db369_50.jpg'
      },
      // ...
    ],
    total: 41255,
    bookmarkRanges: [
      { min: null, max: null },
      { min: 10000, max: null },
      { min: 5000, max: null },
      { min: 1000, max: null },
      { min: 500, max: null },
      { min: 300, max: null },
      { min: 100, max: null },
      { min: 50, max: null }
    ]
  }}}