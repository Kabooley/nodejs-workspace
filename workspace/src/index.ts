"use strict";
// #@@range_begin(list1) // ←これは本にコードを引用するためのものです。読者の皆さんは無視ししてください。
// const request = require('request');
// const fs = require('fs');
// const mkdirp = require('mkdirp');
// const path = require('path');
// const utilities = require('./utilities');

import request = require('request');
import fs = require('fs');
import mkdirp = require('mkdirp');
import path = require('path');
import urlToFilename = require('./utilities');
// #@@range_end(list1)

type spiderCallback = (error: Error | null, filename?: string, bool?: boolean) => void;

// #@@range_begin(list2)
function spider(url: string, callback: spiderCallback) {
  
  // const filename = utilities.urlToFilename(url);
  const filename: string = urlToFilename(url);
  /*****
   * NOTE: fs.exists(filename, exists => {})という書き方は非推奨とのこと
   * 
   * */ 
  fs.exists(filename, exists => {        // ❶
    if(!exists) {
      console.log(`Downloading ${url}`);
      request(url, (err, response, body) => {      // ❷
        if(err) {
          callback(err);
        } else {
          /***
           * mkdirpのバージョン違いのせいか、最新バージョンではコールバックは使わないらしいのでpromiseチェーンに変更する
           * 
           * */ 
          // mkdirp(path.dirname(filename), err => {    // ❸
          //   if(err) {
          //     callback(err);
          //   } else {
          //     fs.writeFile(filename, body, err => { // ❹
          //       if(err) {
          //         callback(err);
          //       } else {
          //         callback(null, filename, true);
          //       }
          //     });
          //   }
          // });
            mkdirp(path.dirname(filename)).then(() => {
              fs.writeFile(filename, body, err => { // ❹
                if(err) {
                  callback(err);
                } else {
                  callback(null, filename, true);
                }
              });
            }).catch(err => {
              callback(err);
            });
            }
          });
        } else {
      callback(null, filename, false);
    }
  });
}
// #@@range_end(list2)

// #@@range_begin(list3)
spider(process.argv[2], (err, filename, downloaded) => {
  if(err) {
    console.log(err);
  } else if(downloaded){
    console.log(`Completed the download of "${filename}"`);
  } else {
    console.log(`"${filename}" was already downloaded`);
  }
});
// #@@range_end(list3)