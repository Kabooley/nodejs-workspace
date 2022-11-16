/*************************************************************
 * https://gist.github.com/jimeh/332765
 * 
 * Super simple Mustache style string replacement.
 * 
 * ***********************************************************/  
export default function mustache(s: string, d: {[x: string]: any}){
	if (typeof(s) === "string" && typeof(d) === "object") {
		for (var key in d) {
			s = s.replace(new RegExp("{{\\s*" + key + "\\s*}}", "g"), d[key]);
		}
	};
	return s;
};


// -- USAGE --
// const url: string = "https://www.pixiv.net/tags/{{keyword}}/artworks?p={{i}}&s_mode=s_tag";
// const filterUrl: string = "https://www.pixiv.net/ajax/search/artworks/{{keyword}}?word={{keyword}}&order=date_d&mode=all&p={{i}}&s_mode=s_tag&type=all&lang=ja";
// 
// console.log(mustache(url, {keyword: encodeURIComponent("COWBOYBEBOP"), i: 11}));
// console.log(mustache(url, {keyword: encodeURIComponent("Epiphany"), i: 44}));