"use strict";

// const urlParse = require('url').parse;
// const slug = require('slug');
// const path = require('path');

// これでモジュール解決ができるようになった
import url = require('url');
import slug = require('slug');
import path = require('path');

const urlParse = url.parse;

// module.exports.urlToFilename = function urlToFilename(url: string): string {

// これでこのutilities.tsはモジュールとして扱われる。
export = function urlToFilename(url: string): string {
  const parsedUrl: url.UrlWithStringQuery = urlParse(url);
  if(!parsedUrl) return "";
  /*****
   * "strict null check"によってタイプガードを設けても
   * 「それnullじゃない？」って言ってくる。
   * 
   * 間違いなくnullにもundefinedにもならないなら下記のように
   * !をつける
   * 
   * いまは厳密なnullチェックを学習する暇がないのでこのままで。
   * */ 
  const urlPath = parsedUrl!.path!.split('/')
    .filter(function(component) {
      return component !== '';
    })
    .map(function(component) {
      return slug(component, { remove: null });
    })
    .join('/');
      
  let filename = path.join(parsedUrl!.hostname!, urlPath);
  if(!path.extname(filename).match(/htm/)) {
    filename += '.html';
  }
  return filename;
};
