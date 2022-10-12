/****
 * 
 * 
 * */ 

/***
 * Retrieves nested property.
 * Passed keys element in keys array must be ordered same as property nested in the object.
 * 
 * If specified key does not exist in object, then returns undefined.
 * 
 * objの中から、keys配列のプロパティに順番にアクセス可能で、
 * 一番最後の要素に一致するプロパティを返す。
 * アクセスできなかったらundefinedを返す。
 * keys配列はobjのプロパティのネスト
 * */ 
const retrieveDeepProp = <T extends object>(obj: T, keys: string[]): any | undefined => {
    let o: object | undefined = obj;
    keys.forEach(key => {
      if(o !== undefined && o.hasOwnProperty(key)){
        o = o[key];
      }
      else{ o = undefined;}
    });
    return o;
};


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
  titleCaptionTranslation?: any;
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


const dummy: iBodyIncludesIllustManga = {
  error: false,
  body: {
    illustManga: {
      data: [
        {
          id: "101393474",
          title: "彼岸の庭渡久１２０６",
          illustType: 1,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/22/00/05/55/101393474_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "彼岸の庭渡様",
            "庭渡久侘歌",
            "豪徳寺ミケ",
            "少名針妙丸",
            "射命丸文",
            "リリーホワイト",
            "リリーブラック"
          ],
          userId: "9824519",
          userName: "人郷想幻（げんそうきょうじん）",
          width: 287,
          height: 821,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 彼岸の庭渡久１２０６ - 人郷想幻（げんそうきょうじん）のマンガ",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-22T00:05:55+09:00",
          updateDate: "2022-09-22T00:05:55+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/06/17/10/08/33/22889909_0d5609f386476846aa404ad4c634e38f_50.jpg"
        },
        {
          id: "101381167",
          title: "落書き11",
          illustType: 0,
          xRestrict: 1,
          restrict: 0,
          sl: 6,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/21/12/18/49/101381167_p0_square1200.jpg",
          description: "",
          tags: [
            "R-18",
            "東方Project",
            "犬走椛",
            "射命丸文"
          ],
          userId: "4472917",
          userName: "kjo",
          width: 960,
          height: 1280,
          pageCount: 20,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方Project 落書き11 - kjoのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-21T12:18:49+09:00",
          updateDate: "2022-09-21T12:18:49+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2020/02/22/02/55/14/17967117_9033a06b5f70d391c5cf66d4e248d847_50.jpg"
        },
        {
          id: "101380663",
          title: "東方二次小説（第13話）「アイドル天狗はたて」（2）～（7）",
          illustType: 0,
          xRestrict: 1,
          restrict: 0,
          sl: 6,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/21/11/33/07/101380663_p0_square1200.jpg",
          description: "",
          tags: [
            "R-18",
            "姫海棠はたて",
            "東方project",
            "射命丸文",
            "管牧典",
            "二ツ岩マミゾウ",
            "封獣ぬえ",
            "ちんぽ",
            "パンチラ"
          ],
          userId: "52941975",
          userName: "美少女帝国",
          width: 1280,
          height: 720,
          pageCount: 6,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#姫海棠はたて 東方二次小説（第13話）「アイドル天狗はたて」（2）～（7） - 美少女帝国のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-21T11:33:07+09:00",
          updateDate: "2022-09-21T11:33:07+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://s.pximg.net/common/images/no_profile_s.png"
        },
        {
          id: "101380056",
          title: "射命丸文",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/21/10/29/36/101380056_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "アナログ",
            "東方Project",
            "射命丸文",
            "墨彩画",
            "我田引水の天狗",
            "清く正しい射命丸",
            "文ちゃんマジ天使",
            "へそチラ",
            "風神少女"
          ],
          userId: "444924",
          userName: "蒲谷カバヂ",
          width: 983,
          height: 1400,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 射命丸文 - 蒲谷カバヂのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-21T10:29:36+09:00",
          updateDate: "2022-09-21T10:29:36+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2015/07/25/12/53/27/9660076_e020ce83db66965c2d5ca9e176af49ba_50.jpg"
        },
        {
          id: "101378399",
          title: "射命丸文",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 4,
          url: "https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2022/09/21/07/30/54/101378399_p0_custom1200.jpg",
          description: "",
          tags: [
            "東方",
            "東方Project",
            "射命丸文",
            "気になる胸元",
            "きょぬーまる",
            "乳寄せ",
            "挟まれたい谷間/魅惑の谷間",
            "天使の小窓",
            "パイズリ希望",
            "香霖堂天狗装束"
          ],
          userId: "30112361",
          userName: "まほろ",
          width: 2591,
          height: 3624,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 射命丸文 - まほろのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-21T07:30:54+09:00",
          updateDate: "2022-09-21T07:30:54+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2020/07/09/08/25/17/18958843_3589880d72650c365556bfe1fafe3fcb_50.jpg"
        },
        {
          id: "101373340",
          title: "文さんと初夜の営み",
          illustType: 0,
          xRestrict: 1,
          restrict: 0,
          sl: 6,
          url: "https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2022/09/21/00/07/19/101373340_p0_custom1200.jpg",
          description: "",
          tags: [
            "R-18",
            "東方Project",
            "射命丸文",
            "おっぱい",
            "きょぬーまる",
            "巨乳"
          ],
          userId: "40851480",
          userName: "しゅしゃん",
          width: 2360,
          height: 1640,
          pageCount: 5,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方Project 文さんと初夜の営み - しゅしゃんのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-21T00:07:19+09:00",
          updateDate: "2022-09-21T00:07:19+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/06/12/22/23/59/22868849_011d9e95a21033ea1081361e5f8045a2_50.jpg"
        },
        {
          id: "101372919",
          title: "霊夢さん不在",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/21/00/00/07/101372919_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "射命丸文",
            "東方Project",
            "あやれいむ"
          ],
          userId: "166682",
          userName: "あ　じさい",
          width: 1447,
          height: 2047,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 霊夢さん不在 - あ　じさいのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-21T00:00:07+09:00",
          updateDate: "2022-09-21T00:00:07+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/02/01/21/35/35/22150015_9191e26cf0da2190e8942f7f234cd569_50.png"
        },
        {
          id: "101372285",
          title: "アヤサン👺",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/20/23/37/15/101372285_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "射命丸文",
            "東方project",
            "東方風神録"
          ],
          userId: "31012491",
          userName: "干し梅",
          width: 5455,
          height: 6395,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 アヤサン👺 - 干し梅のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-20T23:37:15+09:00",
          updateDate: "2022-09-20T23:37:15+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/08/18/12/09/43/23205218_cf9517bc46e9c3620020de9a9aef1b96_50.jpg"
        },
        {
          id: "101371638",
          title: "幻想郷の呼び声  ：著者　マエリベリー・ハーン",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/20/23/11/32/101371638_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "射命丸文",
            "姫海棠はたて"
          ],
          userId: "2390956",
          userName: "稲麻童子（ねお）",
          width: 2086,
          height: 2658,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 幻想郷の呼び声  ：著者　マエリベリー・ハーン - 稲麻童子（ねお）のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-20T23:11:32+09:00",
          updateDate: "2022-09-20T23:11:32+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2014/06/24/01/10/20/8032609_e6ae81ef49600e7cdb80f9c084c57d3b_50.jpg"
        },
        {
          id: "101368144",
          title: "飛び立つ文",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/20/21/00/37/101368144_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "東方Project",
            "射命丸文"
          ],
          userId: "5157183",
          userName: "K&T&K",
          width: 900,
          height: 1200,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 飛び立つ文 - K&T&Kのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-20T21:00:37+09:00",
          updateDate: "2022-09-20T21:00:37+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/06/01/05/15/12/22809929_ac171a31987c94c945410dd895035fe4_50.jpg"
        },
        {
          id: "101357822",
          title: "彼岸の庭渡様１２０４",
          illustType: 1,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/20/08/26/47/101357822_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "彼岸の庭渡様",
            "庭渡久侘歌",
            "豪徳寺ミケ",
            "少名針妙丸",
            "射命丸文",
            "リリーブラック",
            "リリーホワイト"
          ],
          userId: "9824519",
          userName: "人郷想幻（げんそうきょうじん）",
          width: 288,
          height: 824,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 彼岸の庭渡様１２０４ - 人郷想幻（げんそうきょうじん）のマンガ",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-20T08:26:47+09:00",
          updateDate: "2022-09-20T08:26:47+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/06/17/10/08/33/22889909_0d5609f386476846aa404ad4c634e38f_50.jpg"
        },
        {
          id: "101352784",
          title: "深夜のワッフルハウスで談笑する射命丸文と犬走椛とゆっくりさん",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/20/00/38/59/101352784_p0_square1200.jpg",
          description: "",
          tags: [
            "ゆっくりしていってね",
            "東方project",
            "東方",
            "ゆっくり",
            "ゆっくりしていってね!!!",
            "射命丸文",
            "犬走椛"
          ],
          userId: "1382029",
          userName: "広井フロ",
          width: 1500,
          height: 1500,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#ゆっくりしていってね 深夜のワッフルハウスで談笑する射命丸文と犬走椛とゆっくりさん - 広井フロのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-20T00:38:59+09:00",
          updateDate: "2022-09-20T00:38:59+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2012/02/28/07/55/34/4270165_a571e3841cdaeb7bcd2db6fd126f8d78_50.jpg"
        },
        {
          id: "101352076",
          title: "梅雨天狗",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/20/00/14/05/101352076_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "射命丸文",
            "文々。新聞友の会"
          ],
          userId: "5747610",
          userName: "中島楓",
          width: 1160,
          height: 820,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 梅雨天狗 - 中島楓のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-20T00:14:05+09:00",
          updateDate: "2022-09-20T00:14:05+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2021/09/23/20/27/28/21463368_f68f7c71df977321adcc153c35bde8d9_50.png"
        },
        {
          id: "101349731",
          title: "狐巫女文歩行グラフィックver.アクツクMV",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/19/23/03/54/101349731_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "歩行グラフィック",
            "アクションゲームツクールMV",
            "射命丸文",
            "エプロン",
            "きょぬーまる",
            "ファイナルファンタジー",
            "狐巫女",
            "狐巫女文"
          ],
          userId: "5049885",
          userName: "考える人",
          width: 96,
          height: 192,
          pageCount: 6,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 狐巫女文歩行グラフィックver.アクツクMV - 考える人のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-19T23:03:54+09:00",
          updateDate: "2022-09-19T23:03:54+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2014/03/30/22/05/26/7674026_c0be65304f8df08797351721be66d613_50.png"
        },
        {
          id: "101349683",
          title: "東方乗車録",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/19/23/02/40/101349683_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "東方Project",
            "手描き",
            "鉄道",
            "東方乗車録",
            "射命丸文",
            "115系"
          ],
          userId: "582561",
          userName: "HML小田原23号",
          width: 1280,
          height: 720,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 東方乗車録 - HML小田原23号のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-19T23:02:40+09:00",
          updateDate: "2022-09-19T23:02:40+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/09/17/11/10/22/23342768_78a7f0051637ec3043b4eface0479376_50.png"
        },
        {
          id: "101347808",
          title: "9月24日「東方螺茶会 札幌の宴」サークルカット",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2022/09/19/22/02/55/101347808_p0_custom1200.jpg",
          description: "",
          tags: [
            "サークルカット",
            "東方",
            "射命丸文",
            "文々。新聞友の会",
            "カレンダー",
            "東方螺茶会",
            "おでかけライブin札幌"
          ],
          userId: "274931",
          userName: "柚耶＠京都文々。新聞社",
          width: 508,
          height: 839,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#サークルカット 9月24日「東方螺茶会 札幌の宴」サークルカット - 柚耶＠京都文々。新聞社のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-19T22:02:55+09:00",
          updateDate: "2022-09-19T22:02:55+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2010/01/21/15/44/33/1411888_444afae783ec6294f4810e3dc2b85372_50.jpg"
        },
        {
          id: "101344201",
          title: "照れあや",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/19/20/05/19/101344201_p0_square1200.jpg",
          description: "",
          tags: [
            "toho_vote18",
            "第18回東方Project人気投票",
            "守りたい、この笑顔",
            "射命丸文",
            "Touhou",
            "東方Project"
          ],
          userId: "8051038",
          userName: "072斬舞",
          width: 1668,
          height: 2224,
          pageCount: 2,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#toho_vote18 照れあや - 072斬舞のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-19T20:05:19+09:00",
          updateDate: "2022-09-19T20:05:19+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/06/29/23/22/58/22951851_46dbc0b1f8fd77b90f51241897aefc05_50.png"
        },
        {
          id: "101339239",
          title: "妖怪の山の双剣",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2022/09/19/16/44/23/101339239_p0_custom1200.jpg",
          description: "",
          tags: [
            "東方Project",
            "東方",
            "犬走椛",
            "椛",
            "射命丸文",
            "あやもみ"
          ],
          userId: "9726050",
          userName: "係長代理",
          width: 4961,
          height: 7016,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方Project 妖怪の山の双剣 - 係長代理のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-19T16:38:26+09:00",
          updateDate: "2022-09-19T16:44:23+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/05/29/18/24/46/22797408_5e26ab888f811a9676081c941a7cc9e0_50.jpg"
        },
        {
          id: "101338722",
          title: "射命丸文",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 4,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/19/16/15/22/101338722_p0_square1200.jpg",
          description: "",
          tags: [
            "射命丸文",
            "東方"
          ],
          userId: "14309991",
          userName: "めがぎえ",
          width: 3024,
          height: 4032,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#射命丸文 射命丸文 - めがぎえのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-19T16:15:22+09:00",
          updateDate: "2022-09-19T16:15:22+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2021/02/19/10/04/20/20218322_10349a4fd21d052e3a6fff10619d85fe_50.jpg"
        },
        {
          id: "101336067",
          title: "幻想郷最速、試してみる？",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/20/00/16/26/101336067_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "東方Project",
            "射命丸文",
            "ブレザー",
            "きょぬーまる"
          ],
          userId: "352879",
          userName: "いりす",
          width: 2472,
          height: 2667,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 幻想郷最速、試してみる？ - いりすのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-19T13:57:00+09:00",
          updateDate: "2022-09-20T00:16:26+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/09/15/06/26/42/23334236_d7a3ce0e0bccb82001df500b5620dcfe_50.jpg"
        },
        {
          id: "101334687",
          title: "先日我がつべチャンネルの11回目ぐらいの誕生日だったので",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2022/09/19/12/42/34/101334687_p0_custom1200.jpg",
          description: "",
          tags: [
            "東方Project",
            "博麗霊夢",
            "霧雨魔理沙",
            "レミリア・スカーレット",
            "フランドール・スカーレット",
            "魂魄妖夢",
            "因幡てゐ",
            "藤原妹紅",
            "伊吹萃香",
            "射命丸文"
          ],
          userId: "15395849",
          userName: "倉うどん",
          width: 1000,
          height: 1800,
          pageCount: 6,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方Project 先日我がつべチャンネルの11回目ぐらいの誕生日だったので - 倉うどんのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-19T12:42:34+09:00",
          updateDate: "2022-09-19T12:42:34+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2021/04/07/20/23/50/20494824_ca7344292f8f583fec76cd567a57f584_50.jpg"
        },
        {
          id: "101328931",
          title: "人里の中人身売買されるあややちゃん",
          illustType: 0,
          xRestrict: 1,
          restrict: 0,
          sl: 6,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/19/04/47/53/101328931_p0_square1200.jpg",
          description: "",
          tags: [
            "R-18",
            "東方",
            "射命丸文",
            "エロステータス"
          ],
          userId: "16130389",
          userName: "白木杉",
          width: 810,
          height: 1080,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 人里の中人身売買されるあややちゃん - 白木杉のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-19T04:47:53+09:00",
          updateDate: "2022-09-19T04:47:53+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2017/03/22/00/19/34/12301156_6edf987c4e86443d8e2961e4d557aa6d_50.png"
        },
        {
          id: "101327895",
          title: "ガンダムバトルオペレーション２　カウンティングMS　エピソード１",
          illustType: 1,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/19/03/10/07/101327895_p0_square1200.jpg",
          description: "",
          tags: [
            "漫画",
            "射命丸文",
            "東方Project",
            "東方",
            "ガンダムバトルオペレーション2",
            "MS"
          ],
          userId: "18965179",
          userName: "文々。新聞（ブンブンマル新聞）",
          width: 2976,
          height: 4096,
          pageCount: 4,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#射命丸文 ガンダムバトルオペレーション２　カウンティングMS　エピソード１ - 文々。新聞（ブンブンマル新聞）のマンガ",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-19T03:10:07+09:00",
          updateDate: "2022-09-19T03:10:07+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/01/10/13/09/01/22028142_cb75c04fce55f5a02db527d7df620230_50.jpg"
        },
        {
          id: "101326702",
          title: "星月夜",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/19/01/50/22/101326702_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "東方Project",
            "東方MMD",
            "射命丸文",
            "姫海棠はたて",
            "あやはた"
          ],
          userId: "42857771",
          userName: "Copy_Alcide",
          width: 3840,
          height: 2160,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 星月夜 - Copy_Alcideのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-19T01:50:22+09:00",
          updateDate: "2022-09-19T01:50:22+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2020/08/26/18/35/34/19253632_76edb7c8973ae97966fe9cc1753104e7_50.jpg"
        },
        {
          id: "101324438",
          title: "Aya",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/19/00/13/58/101324438_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "射命丸文"
          ],
          userId: "24358",
          userName: "あすなろ",
          width: 787,
          height: 1243,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 Aya - あすなろのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-19T00:13:58+09:00",
          updateDate: "2022-09-19T00:13:58+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2019/08/31/01/18/09/16218127_735d5b797c862362109023f4ec284199_50.png"
        },
        {
          id: "101322714",
          title: "練習絵22　射命丸文の模写擬き",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/18/23/31/12/101322714_p0_square1200.jpg",
          description: "",
          tags: [
            "練習絵",
            "イラスト初心者",
            "イラスト",
            "模写もどき",
            "東方",
            "東方project",
            "射命丸文",
            "女の子"
          ],
          userId: "84473374",
          userName: "琥珀",
          width: 4134,
          height: 5512,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#練習絵 練習絵22　射命丸文の模写擬き - 琥珀のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-18T23:31:12+09:00",
          updateDate: "2022-09-18T23:31:12+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/09/09/00/32/13/23307033_b15f39fbf27a0531ebe6367eaf934aa0_50.png"
        },
        {
          id: "101322037",
          title: "文「いきなりの呼び出しで来てみたら…」",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 6,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/18/23/07/00/101322037_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "射命丸文",
            "博麗霊夢",
            "あやれいむ",
            "さらし",
            "腹筋",
            "ふんどし",
            "東方褌縛娘"
          ],
          userId: "14368981",
          userName: "hiko★",
          width: 2048,
          height: 1645,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 文「いきなりの呼び出しで来てみたら…」 - hiko★のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-18T23:07:00+09:00",
          updateDate: "2022-09-18T23:07:00+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2018/09/22/14/08/36/14805198_84f948a7c229a7a7e0868a2b8ab1796b_50.jpg"
        },
        {
          id: "101317290",
          title: "散策する射命丸文",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2022/09/18/20/30/01/101317290_p0_custom1200.jpg",
          description: "",
          tags: [
            "色鉛筆",
            "アナログ",
            "東方",
            "東方Project",
            "風景",
            "射命丸文",
            "紅葉"
          ],
          userId: "270284",
          userName: "erythro",
          width: 1500,
          height: 2211,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#色鉛筆 散策する射命丸文 - erythroのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-18T20:30:01+09:00",
          updateDate: "2022-09-18T20:30:01+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2021/04/17/08/54/21/20545521_f08550c7fe2109e7049f3f09100e4e79_50.jpg"
        },
        {
          id: "101313358",
          title: "東方フェチMMD その34 -鴉天狗服装コレクション-",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2022/09/18/17/54/41/101313358_p0_custom1200.jpg",
          description: "",
          tags: [
            "東方",
            "MMD",
            "射命丸文",
            "生靴下",
            "ソックス足裏"
          ],
          userId: "696509",
          userName: "氷小",
          width: 1280,
          height: 720,
          pageCount: 7,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 東方フェチMMD その34 -鴉天狗服装コレクション- - 氷小のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-18T17:54:41+09:00",
          updateDate: "2022-09-18T17:54:41+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2010/11/14/12/56/12/2407565_e61f9aeb8b45f21909b1f681b54ea5d4_50.png"
        },
        {
          id: "101312011",
          title: "射命丸 文からバレンタインのチョコが貰える画像",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/18/16/52/41/101312011_p0_square1200.jpg",
          description: "",
          tags: [
            "wombo",
            "wombodream",
            "womboart",
            "Ai",
            "東方Project",
            "東方プロジェクト",
            "射命丸文",
            "あやや",
            "東方Projectのキャラをエモく描いて貰うチャレンジ"
          ],
          userId: "7282648",
          userName: "狗鷲天狗(イヌワシ)",
          width: 1080,
          height: 1920,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#wombo 射命丸 文からバレンタインのチョコが貰える画像 - 狗鷲天狗(イヌワシ)のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-18T16:52:41+09:00",
          updateDate: "2022-09-18T16:52:41+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/09/09/22/55/56/23310431_c379e107c2a8064ba69d86488ebdc942_50.jpg"
        },
        {
          id: "101310159",
          title: "ゴンブトガラス",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 4,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/18/15/17/27/101310159_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "ふといの",
            "ぽっちゃり",
            "射命丸文",
            "姫海棠はたて",
            "犬走椛",
            "ふてぇ丸"
          ],
          userId: "1345491",
          userName: "slnchyt",
          width: 750,
          height: 750,
          pageCount: 3,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 ゴンブトガラス - slnchytのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-18T15:17:27+09:00",
          updateDate: "2022-09-18T15:17:27+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2016/04/12/04/05/22/10796821_f078dec4928763c77f8680f3377f8fa7_50.png"
        },
        {
          id: "101305678",
          title: "Mysterious Mountain",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/18/11/07/56/101305678_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "射命丸文",
            "犬走椛",
            "姫海棠はたて",
            "飯綱丸龍",
            "四天狗"
          ],
          userId: "9423987",
          userName: "やこうせいの亀",
          width: 2039,
          height: 1377,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 Mysterious Mountain - やこうせいの亀のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-18T11:07:56+09:00",
          updateDate: "2022-09-18T11:07:56+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2015/02/23/02/01/38/9009093_63ed43fb66d61d1b915e2744bbde854a_50.jpg"
        },
        {
          id: "101302969",
          title: "aya",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/18/07/24/51/101302969_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "東方project",
            "東方Project",
            "touhou",
            "射命丸文"
          ],
          userId: "27742348",
          userName: "Tastyfood",
          width: 3200,
          height: 4800,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 aya - Tastyfoodのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-18T07:24:51+09:00",
          updateDate: "2022-09-18T07:24:51+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/01/14/14/27/28/22049028_8214d6f15f8d76c4c55ea70758d72592_50.png"
        },
        {
          id: "101297330",
          title: "彼岸の庭渡様１２０２",
          illustType: 1,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/18/00/03/50/101297330_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "彼岸の庭渡様",
            "庭渡久侘歌",
            "豪徳寺ミケ",
            "少名針妙丸",
            "射命丸文"
          ],
          userId: "9824519",
          userName: "人郷想幻（げんそうきょうじん）",
          width: 288,
          height: 824,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 彼岸の庭渡様１２０２ - 人郷想幻（げんそうきょうじん）のマンガ",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-18T00:03:50+09:00",
          updateDate: "2022-09-18T00:03:50+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/06/17/10/08/33/22889909_0d5609f386476846aa404ad4c634e38f_50.jpg"
        },
        {
          id: "101293681",
          title: "人気投票2022",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/17/22/00/05/101293681_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "デフォ絵",
            "豊聡耳神子",
            "摩多羅隠岐奈",
            "埴安神袿姫",
            "飯綱丸龍",
            "射命丸文",
            "藤原妹紅",
            "宇佐見蓮子",
            "toho_vote18"
          ],
          userId: "228643",
          userName: "風葉",
          width: 2400,
          height: 2400,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 人気投票2022 - 風葉のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-17T22:00:05+09:00",
          updateDate: "2022-09-17T22:00:05+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2021/05/31/02/36/44/20793409_97898137a139d2c5eb4348b5edd7da50_50.png"
        },
        {
          id: "101292252",
          title: "(キャラ配布)射命丸文",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/17/21/10/53/101292252_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "恋活",
            "キャラ配布(コイカツ)",
            "コイカツ!",
            "人物卡",
            "射命丸文"
          ],
          userId: "73177641",
          userName: "呵呵呵h（异形制造商）",
          width: 3840,
          height: 2160,
          pageCount: 2,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 (キャラ配布)射命丸文 - 呵呵呵h（异形制造商）のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-17T21:10:53+09:00",
          updateDate: "2022-09-17T21:10:53+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/06/24/16/52/36/22925570_937665f583f69d260946a6fb91447c4f_50.jpg"
        },
        {
          id: "101287121",
          title: "DL配信・販売されてました",
          illustType: 0,
          xRestrict: 1,
          restrict: 0,
          sl: 6,
          url: "https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2022/09/17/17/37/10/101287121_p0_custom1200.jpg",
          description: "",
          tags: [
            "R-18",
            "射命丸文",
            "東方Project",
            "おっぱい"
          ],
          userId: "14405546",
          userName: "SUZUNA",
          width: 1158,
          height: 1637,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#射命丸文 DL配信・販売されてました - SUZUNAのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-17T17:37:10+09:00",
          updateDate: "2022-09-17T17:37:10+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/05/29/16/36/07/22796872_26388a08bf3ba4b159ae1d20756dff45_50.png"
        },
        {
          id: "101286128",
          title: "あや :>",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/17/16/48/03/101286128_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "女の子",
            "東方Project",
            "射命丸文"
          ],
          userId: "76195669",
          userName: "Eastern Chef",
          width: 2894,
          height: 4093,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 あや :> - Eastern Chefのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-17T16:48:03+09:00",
          updateDate: "2022-09-17T16:48:03+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/08/30/18/45/33/23264248_57dde7d26dbf88cbb6932a94309a9411_50.jpg"
        },
        {
          id: "101285057",
          title: "射命丸文",
          illustType: 0,
          xRestrict: 1,
          restrict: 0,
          sl: 6,
          url: "https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2022/09/17/15/45/45/101285057_p0_custom1200.jpg",
          description: "",
          tags: [
            "R-18",
            "東方",
            "東方project",
            "东方",
            "射命丸文"
          ],
          userId: "21332886",
          userName: "南卡懒",
          width: 3508,
          height: 2480,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 射命丸文 - 南卡懒のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-17T15:45:45+09:00",
          updateDate: "2022-09-17T15:45:45+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/07/04/23/22/44/22976511_73feee2165748afeeca4e8986bcd5877_50.png"
        },
        {
          id: "101279311",
          title: "週末天狗【けむけむ】",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/17/09/22/51/101279311_p0_square1200.jpg",
          description: "",
          tags: [
            "東方project",
            "射命丸文",
            "犬走椛",
            "週末天狗",
            "秋刀魚/七輪"
          ],
          userId: "683771",
          userName: "双月える",
          width: 724,
          height: 1023,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方project 週末天狗【けむけむ】 - 双月えるのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-17T09:22:51+09:00",
          updateDate: "2022-09-17T09:22:51+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2012/11/22/19/14/27/5445261_05eebfdf76f092925cf6bc48e4770e88_50.png"
        },
        {
          id: "101277125",
          title: "彼岸の庭渡様１２０１",
          illustType: 1,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/17/05/29/24/101277125_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "彼岸の庭渡様",
            "庭渡久侘歌",
            "豪徳寺ミケ",
            "少名針妙丸",
            "射命丸文"
          ],
          userId: "9824519",
          userName: "人郷想幻（げんそうきょうじん）",
          width: 288,
          height: 824,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 彼岸の庭渡様１２０１ - 人郷想幻（げんそうきょうじん）のマンガ",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-17T05:29:24+09:00",
          updateDate: "2022-09-17T05:29:24+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/06/17/10/08/33/22889909_0d5609f386476846aa404ad4c634e38f_50.jpg"
        },
        {
          id: "101274618",
          title: "ayamomi",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/17/01/36/14/101274618_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "東方Project",
            "あやもみ",
            "犬走椛",
            "射命丸文"
          ],
          userId: "34572286",
          userName: "vousser",
          width: 1458,
          height: 1777,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 ayamomi - vousserのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-17T01:36:14+09:00",
          updateDate: "2022-09-17T01:36:14+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2021/08/26/06/24/36/21297828_b171b5dfe0d8ac0762c4ca8ab9a6e3d4_50.png"
        },
        {
          id: "101272906",
          title: "だいたい文ちゃんまとめ",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2022/09/17/00/16/38/101272906_p0_custom1200.jpg",
          description: "",
          tags: [
            "射命丸文",
            "博麗霊夢",
            "東方"
          ],
          userId: "18058067",
          userName: "Kオス",
          width: 1036,
          height: 1300,
          pageCount: 7,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#射命丸文 だいたい文ちゃんまとめ - Kオスのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-17T00:16:38+09:00",
          updateDate: "2022-09-17T00:16:38+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2020/10/02/10/18/51/19447351_9de0f0099431d657bbcc3e8c4dc8dd67_50.jpg"
        },
        {
          id: "101270794",
          title: "【第18回東方人気投票】回復はアイテムで充分",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2022/09/16/23/08/48/101270794_p0_custom1200.jpg",
          description: "",
          tags: [
            "第18回東方Project人気投票",
            "toho_vote18",
            "伊吹萃香",
            "博麗霊夢",
            "因幡てゐ",
            "上海人形",
            "レミリア・スカーレット",
            "洩矢諏訪子",
            "射命丸文",
            "ドット絵"
          ],
          userId: "15395849",
          userName: "倉うどん",
          width: 2560,
          height: 1440,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#第18回東方Project人気投票 【第18回東方人気投票】回復はアイテムで充分 - 倉うどんのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-16T23:08:48+09:00",
          updateDate: "2022-09-16T23:08:48+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2021/04/07/20/23/50/20494824_ca7344292f8f583fec76cd567a57f584_50.jpg"
        },
        {
          id: "101269793",
          title: "ミニスカポリス風阿求ちゃん",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/16/22/32/28/101269793_p0_square1200.jpg",
          description: "",
          tags: [
            "東方Project",
            "稗田阿求",
            "射命丸文",
            "ミニスカポリス",
            "東方警察",
            "スカート押さえ",
            "あきゅぱい",
            "ふともも",
            "手錠"
          ],
          userId: "844703",
          userName: "公星",
          width: 709,
          height: 1000,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方Project ミニスカポリス風阿求ちゃん - 公星のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-16T22:32:28+09:00",
          updateDate: "2022-09-16T22:32:28+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2014/03/20/00/39/59/7624068_a88ed426977355f22d26b34c7950c25a_50.jpg"
        },
        {
          id: "101269677",
          title: "バレットフィリアは「実在」する……！",
          illustType: 1,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/16/22/28/38/101269677_p0_square1200.jpg",
          description: "",
          tags: [
            "漫画",
            "霧雨魔理沙",
            "博麗霊夢",
            "東方",
            "摩多羅隠岐奈",
            "射命丸文",
            "バレットフィリア達の闇市場",
            "文チル",
            "おきフラ",
            "HENTAI"
          ],
          userId: "390501",
          userName: "インド僧Skeb募集中",
          width: 892,
          height: 1285,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#霧雨魔理沙 バレットフィリアは「実在」する……！ - インド僧Skeb募集中のマンガ",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-16T22:28:38+09:00",
          updateDate: "2022-09-16T22:28:38+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2008/10/25/15/52/54/343895_9c8315de9a0994cdf203193cb11676e2_50.jpg"
        },
        {
          id: "101269266",
          title: "射命丸文",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 4,
          url: "https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2022/09/16/22/12/42/101269266_p0_custom1200.jpg",
          description: "",
          tags: [
            "東方",
            "射命丸文"
          ],
          userId: "53610272",
          userName: "かそか",
          width: 1400,
          height: 2048,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 射命丸文 - かそかのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-16T22:12:42+09:00",
          updateDate: "2022-09-16T22:12:42+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://s.pximg.net/common/images/no_profile_s.png"
        },
        {
          id: "101267722",
          title: "天狗装束あやちゃん",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/16/21/16/09/101267722_p0_square1200.jpg",
          description: "",
          tags: [
            "東方Project",
            "射命丸文",
            "足組み"
          ],
          userId: "15703485",
          userName: "こましはん",
          width: 2480,
          height: 3508,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方Project 天狗装束あやちゃん - こましはんのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-16T21:16:09+09:00",
          updateDate: "2022-09-16T21:16:09+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/09/12/20/29/32/23324101_a911917beb990cb948abee2ad585c28d_50.jpg"
        },
        {
          id: "101267580",
          title: "鴉天狗EX",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/16/21/10/11/101267580_p0_square1200.jpg",
          description: "",
          tags: [
            "東方project",
            "アナログ",
            "射命丸文"
          ],
          userId: "22241207",
          userName: "いけだるりこ",
          width: 900,
          height: 1151,
          pageCount: 4,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方project 鴉天狗EX - いけだるりこのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-16T21:10:11+09:00",
          updateDate: "2022-09-16T21:10:11+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2020/06/09/21/00/33/18796836_70baa448c0a3104981f32c7fea8f9c0e_50.jpg"
        },
        {
          id: "101263412",
          title: "ルポライター文ちゃん",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/16/18/05/12/101263412_p0_square1200.jpg",
          description: "",
          tags: [
            "東方Project",
            "射命丸文",
            "清く正しい射命丸",
            "東方鈴奈庵",
            "キャスケット文",
            "文ちゃんマジ天使",
            "稗田阿求",
            "笑顔",
            "東方Project1000users入り",
            "社会派ルポライターあや"
          ],
          userId: "2520952",
          userName: "カンパ",
          width: 1433,
          height: 1013,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方Project ルポライター文ちゃん - カンパのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-16T18:05:12+09:00",
          updateDate: "2022-09-16T18:05:12+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2017/02/14/22/11/58/12148643_e5fd596badc37b70db02a2b2c1c36e69_50.jpg"
        },
        {
          id: "101262691",
          title: "調教文ちゃん",
          illustType: 0,
          xRestrict: 1,
          restrict: 0,
          sl: 6,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/16/17/24/33/101262691_p0_square1200.jpg",
          description: "",
          tags: [
            "R-18",
            "東方",
            "射命丸文",
            "陰毛"
          ],
          userId: "9251226",
          userName: "みだりん＠お仕事募集中",
          width: 914,
          height: 1520,
          pageCount: 8,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 調教文ちゃん - みだりん＠お仕事募集中のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-16T17:24:33+09:00",
          updateDate: "2022-09-16T17:24:33+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2019/05/03/05/02/14/15720885_2d4a837a871681ccb95bfbc5dca6d03f_50.png"
        },
        {
          id: "101259693",
          title: "香霖堂天狗装束のブン屋",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/16/13/08/32/101259693_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "射命丸文",
            "香霖堂天狗装束",
            "気になる胸元",
            "射命丸は幻想郷一の可愛さ",
            "きょぬーまる"
          ],
          userId: "461914",
          userName: "弐ヶのん",
          width: 706,
          height: 986,
          pageCount: 2,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 香霖堂天狗装束のブン屋 - 弐ヶのんのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-16T13:08:32+09:00",
          updateDate: "2022-09-16T13:08:32+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2015/07/19/03/17/57/9632447_ce0648a6de650e889a33e590b72ede78_50.jpg"
        },
        {
          id: "101256160",
          title: "東方全キャラ制覇の軌跡　36　射命丸文",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/16/07/15/09/101256160_p0_square1200.jpg",
          description: "",
          tags: [
            "東方全キャラ制覇",
            "東方",
            "東方project",
            "広島弁チルノシリーズ",
            "射命丸文"
          ],
          userId: "1048577",
          userName: "東横とこ（広島弁チルノ）",
          width: 1200,
          height: 1704,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方全キャラ制覇 東方全キャラ制覇の軌跡　36　射命丸文 - 東横とこ（広島弁チルノ）のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-16T07:15:09+09:00",
          updateDate: "2022-09-16T07:15:09+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/07/24/15/42/20/23074200_612ff5c1571d40fce765e4485de8b7a0_50.jpg"
        },
        {
          id: "101255342",
          title: "彼岸の庭渡様１２００",
          illustType: 1,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/16/05/26/11/101255342_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "彼岸の庭渡様",
            "庭渡久侘歌",
            "豪徳寺ミケ",
            "少名針妙丸",
            "射命丸文"
          ],
          userId: "9824519",
          userName: "人郷想幻（げんそうきょうじん）",
          width: 288,
          height: 824,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 彼岸の庭渡様１２００ - 人郷想幻（げんそうきょうじん）のマンガ",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-16T05:26:11+09:00",
          updateDate: "2022-09-16T05:26:11+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/06/17/10/08/33/22889909_0d5609f386476846aa404ad4c634e38f_50.jpg"
        },
        {
          id: "101253454",
          title: "毎度の金曜椛ちゃん～！",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/16/02/02/55/101253454_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "椛",
            "文",
            "犬走椛",
            "射命丸文",
            "週末天狗",
            "肩もみあや"
          ],
          userId: "1212242",
          userName: "名雲 稔",
          width: 920,
          height: 927,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 毎度の金曜椛ちゃん～！ - 名雲 稔のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-16T02:02:55+09:00",
          updateDate: "2022-09-16T02:02:55+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2010/03/29/23/07/02/1625804_0ce0203647ead545f43f95f8c9c9f7c6_50.jpg"
        },
        {
          id: "101248234",
          title: "(SAMPLE)ふたなりあやさな♥",
          illustType: 0,
          xRestrict: 1,
          restrict: 0,
          sl: 6,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/15/22/26/10/101248234_p0_square1200.jpg",
          description: "",
          tags: [
            "R-18",
            "東方",
            "ふたなり",
            "射命丸文",
            "東風谷早苗",
            "背後から胸揉み",
            "ふたゆり",
            "さなぱい",
            "手加減できない射命丸",
            "こいつら交尾したんだ!!"
          ],
          userId: "9448265",
          userName: "サニーサイド🍳",
          width: 1730,
          height: 1880,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 (SAMPLE)ふたなりあやさな♥ - サニーサイド🍳のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-15T22:26:10+09:00",
          updateDate: "2022-09-15T22:26:10+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/09/20/02/47/46/23356672_6822e13bdb7d10829e4fa33ef926785b_50.png"
        },
        {
          id: "101244635",
          title: "射命丸文",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/15/20/00/19/101244635_p0_square1200.jpg",
          description: "",
          tags: [
            "東方project",
            "アナログ",
            "射命丸文"
          ],
          userId: "22241207",
          userName: "いけだるりこ",
          width: 900,
          height: 1285,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方project 射命丸文 - いけだるりこのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-15T20:00:19+09:00",
          updateDate: "2022-09-15T20:00:19+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2020/06/09/21/00/33/18796836_70baa448c0a3104981f32c7fea8f9c0e_50.jpg"
        },
        {
          id: "101242671",
          title: "本日の投稿分",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/15/18/10/26/101242671_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "庭渡久侘歌",
            "豪徳寺ミケ",
            "矢田寺成美",
            "高麗野あうん",
            "天弓千亦",
            "エレン",
            "多々良小傘",
            "射命丸文"
          ],
          userId: "9824519",
          userName: "人郷想幻（げんそうきょうじん）",
          width: 678,
          height: 858,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 本日の投稿分 - 人郷想幻（げんそうきょうじん）のイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-15T18:10:26+09:00",
          updateDate: "2022-09-15T18:10:26+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/06/17/10/08/33/22889909_0d5609f386476846aa404ad4c634e38f_50.jpg"
        },
        {
          id: "101241730",
          title: "◆アナログ◆あや◆",
          illustType: 0,
          xRestrict: 0,
          restrict: 0,
          sl: 2,
          url: "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/15/17/06/47/101241730_p0_square1200.jpg",
          description: "",
          tags: [
            "東方",
            "射命丸文",
            "アナログ",
            "ヤフオク",
            "東方project"
          ],
          userId: "24254961",
          userName: "やさぐれ＠えりまきとかげ",
          width: 788,
          height: 891,
          pageCount: 1,
          isBookmarkable: true,
          bookmarkData: null,
          alt: "#東方 ◆アナログ◆あや◆ - やさぐれ＠えりまきとかげのイラスト",
          titleCaptionTranslation: {
            workTitle: null,
            workCaption: null
          },
          createDate: "2022-09-15T17:06:47+09:00",
          updateDate: "2022-09-15T17:06:47+09:00",
          isUnlisted: false,
          isMasked: false,
          profileImageUrl: "https://i.pximg.net/user-profile/img/2022/09/01/21/46/00/23274102_15935b137ff28d2db59a8ca42981ec21_50.jpg"
        }
      ],
      total: 49561,
    }
  }
};


// const data: iIllustMangaDataElement[] = retrieveDeepProp<iBodyIncludesIllustManga>(
//   dummy,
//   ["body", "illustManga", "data"]
// );

const reduceDeepProp = (keys: string[], o: object) => {
  // return keys.reduce((previousValue, currentValue) => (previousValue && previousValue[currentValue]) ? previousValue[currentValue] : null, o)
  return keys.reduce((previousValue, currentValue) => {
    console.log(previousValue);
    console.log(currentValue);
    return (previousValue && previousValue[currentValue]) ? previousValue[currentValue] : null
  }, o)
};

console.log(reduceDeepProp(["body", "illustManga", "data"], dummy));

