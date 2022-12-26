/************************************************************
 * Solve iIllustData.tags: {} to iIllustData.tags.tags.tags: iTags[]
 * 
 * *********************************************************/ 
import type { iIllustData, iTags } from './typeOfArtworkPage';
import { retrieveDeepProp } from '../../utilities/objectModifier';
import { Collect } from '../Collect';

export const resolveTags = (data: iIllustData): string[] => {
    const tags: iTags[] =  retrieveDeepProp<iTags[]>(["tags", "tags", "tags"], data);
    if(tags === undefined) throw new Error("Error: data: iIllustData does not includes 'tags' property.");
    
    const collecter = new Collect<iTags>();
    collecter.setData(tags);
    return collecter.collectProperties("tag") as string[];
};

// --- usage ---
// 
// const dummy: iIllustData = {
//     illustId: '97618246',
//     illustTitle: 'チャイナキャス狐',
//     illustComment: '初中華です',
//     id: '97618246',
//     title: 'チャイナキャス狐',
//     description: '初中華です',
//     illustType: 0,
//     createDate: '2022-04-14T05:53:00+00:00',
//     uploadDate: '2022-04-14T05:53:00+00:00',
//     restrict: 0,
//     xRestrict: 0,
//     sl: 4,
//     urls: {
//       mini: 'https://i.pximg.net/c/48x48/img-master/img/2022/04/14/14/53/51/97618246_p0_square1200.jpg',
//       thumb: 'https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/04/14/14/53/51/97618246_p0_square1200.jpg',
//       small: 'https://i.pximg.net/c/540x540_70/img-master/img/2022/04/14/14/53/51/97618246_p0_master1200.jpg',
//       regular: 'https://i.pximg.net/img-master/img/2022/04/14/14/53/51/97618246_p0_master1200.jpg',
//       original: 'https://i.pximg.net/img-original/img/2022/04/14/14/53/51/97618246_p0.jpg'
//     },
//     tags: {
//       authorId: '1047320',
//       isLocked: false,
//       tags: {
//         authorId:"1047320",
//         isLocked:false,
//         tags:[
//             {tag:"玉藻の前",locked:true,deletable:false,userId:"1047320",userName:"ワイズスピーク@単行本発売中！"},
//             {tag:"キャス狐",locked:true,deletable:false,userId:"1047320",userName:"ワイズスピーク@単行本発売中！"},
//             {tag:"Fate/EXTRA",locked:true,deletable:false,userId:"1047320",userName:"ワイズスピーク@単行本発売中！"},
//             {tag:"尻神様",locked:false,deletable:true},{tag:"玉藻の前(Fate)",locked:false,deletable:true},
//             {tag:"自称初中華兄貴",locked:false,deletable:true},{tag:"裸足",locked:false,deletable:true},
//             {tag:"パンチラ",locked:false,deletable:true},{tag:"Fate/EXTRA5000users入り",locked:false,deletable:true},
//             {tag:"斎藤千和",locked:false,deletable:true}
//         ],
//         writable:true
//     },
//       writable: true
//     },
//     alt: '#玉藻の前 チャイナキャス狐 - ワイズスピーク@単行本発売中！のイラスト',
//     storableTags: [
//       'y68AFldGp7', 'aKAp3RlsBg',
//       '9kbEA1dZeA', 'KN7uxuR89w',
//       '3g8y5LDx4G', 'g7xjaRuu1p',
//       'HY55MqmzzQ', 'gVfGX_rH_Y',
//       'asHH1_jNXv', 'YblYjqLXb_'
//     ],
//     userId: '1047320',
//     userName: 'ワイズスピーク@単行本発売中！',
//     userAccount: 'hikomaro610',
//     userIllusts: {
//       '5141539': null,
//       '5153047': null,
//       '20635484': null,
//       '20637434': null,
//       '101175499': null,
//       '101198029': null,
//       '101239818': null,
//       '101931343': null,
//       '102012264': null,
//       '102450012': null,
//       '102502835': null,
//       '102534269': null,
//       '103169861': null,
//       '103500457': null
//     },
//     likeData: false,
//     width: 1447,
//     height: 2160,
//     pageCount: 1,
//     bookmarkCount: 11681,
//     likeCount: 6957,
//     commentCount: 26,
//     responseCount: 0,
//     viewCount: 51179,
//     bookStyle: 0,
//     isHowto: false,
//     isOriginal: false,
//     imageResponseOutData: [],
//     imageResponseData: [],
//     imageResponseCount: 0,
//     pollData: null,
//     seriesNavData: null,
//     descriptionBoothId: null,
//     descriptionYoutubeId: null,
//     comicPromotion: null,
//     fanboxPromotion: {
//       userName: 'ワイズスピーク@単行本発売中！',
//       userImageUrl: 'https://i.pximg.net/user-profile/img/2017/08/11/19/18/51/13020245_fdd8b7bacebcb472693c42084d417d5b_170.jpg',
//       contentUrl: 'https://www.pixiv.net/fanbox/creator/1047320?utm_campaign=www_artwork&amp;utm_medium=site_flow&amp;utm_source=pixiv',
//       description: 'フリーのイラストレーター、漫画家のワイズスピークと申します。\n' +
//         '『ワイズスピーク』は、「こがさきゆいな」と「ようめい」の二人組のユニットです。\n' +
//         '同人活動はサークル『やみつき本舗』にて行っています。\n' +
//         '\n' +
//         '試行錯誤しながら運用していけたらいいなーと思っています！\n' +
//         '\n' +
//         '\n' +
//         '※どのプランでもすべての記事をお読み頂けます。\n' +
//         '\n' +
//         '\n' +
//         'お仕事履歴\n' +
//         '\n' +
//         '全年齢\n' +
//         'Fate/Grand Order電撃コミックアンソロジー11\n' +
//         '同12\n' +
//         '同13\n' +
//         '同14\n' +
//         '同16\n' +
//         '\n' +
//         '成人向け\n' +
//         'コミックアンスリウム \n' +
//         '2018 4月号\n' +
//         '2018 9月号\n' +
//         '2019 2月号\n' +
//         '2019 5月号\n' +
//         '2019 10月号\n' +
//         '\n' +
//         '合同企画\n' +
//         '『おさななじみと。』\n' +
//         '『Melty H』\n' +
//         '『最終制服女史』\n' +
//         '\n' +
//         'イベント関係\n' +
//         'コスホリック23イメージイラスト\n' +
//         'メロンブックス　女身くじ第四弾【乳くじ】HAPPY NEW(乳) YEAR『中乳』',
//       imageUrl: 'https://pixiv.pximg.net/c/520x280_90_a2_g5/fanbox/public/images/creator/1047320/cover/TUfJ0UEoBDxN8knpQIXrHqu4.jpeg',
//       imageUrlMobile: 'https://pixiv.pximg.net/c/520x280_90_a2_g5/fanbox/public/images/creator/1047320/cover/TUfJ0UEoBDxN8knpQIXrHqu4.jpeg',
//       hasAdultContent: true
//     },
//     contestBanners: [],
//     isBookmarkable: true,
//     bookmarkData: null,
//     contestData: null,
//     zoneConfig: {},
//     extraData: {},
//     titleCaptionTranslation: { workTitle: null, workCaption: null },
//     isUnlisted: false,
//     request: null,
//     commentOff: 0,
//     aiType: 0
//   };

  
// console.log(resolveTags(dummy));