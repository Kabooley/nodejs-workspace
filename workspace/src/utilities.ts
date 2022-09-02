"use strict";

// const urlParse = require('url').parse;
// const slug = require('slug');
// const path = require('path');

// これでモジュール解決ができるようになった
import url = require('url');
import slug = require('slug');
import path = require('path');
import cheerio = require('cheerio');

const urlParse = url.parse;
const urlResolve = url.resolve;

function urlToFilename(url: string): string {
  const parsedUrl: url.UrlWithStringQuery = urlParse(url);
  if(!parsedUrl) return "";
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

function getLinkUrl(currentUrl: string, element: cheerio.TagElement) {
  const link = urlResolve(currentUrl, element.attribs.href || "");
  const parsedLink = urlParse(link);
  const currentParsedUrl = urlParse(currentUrl);
  if(parsedLink.hostname !== currentParsedUrl.hostname
    || !parsedLink.pathname) {
    return null;
  }
  return link;
};

function getPageLinks(currentUrl: string, body: string) {
  return [].slice.call(cheerio.load(body)('a'))
    .map(function(element) {
      return module.exports.getLinkUrl(currentUrl, element);
    })
    .filter(function(element) {
      return !!element;
    });
};

export = {
  urlToFilename: urlToFilename,
  getLinkUrl: getLinkUrl,
  getPageLinks: getPageLinks
};