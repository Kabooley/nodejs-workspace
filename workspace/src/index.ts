"use strict";

import request = require('request');
import fs = require('fs');
import mkdirp = require('mkdirp');
import path = require('path');
import utilities = require('./utilities');
 

function spiderLinks(currentUrl: string, body: string, nesting: number, callback: any) {
  if(nesting === 0) {
    return process.nextTick(callback);
  }

  const links = utilities.getPageLinks(currentUrl, body);  //[1]
  if(links.length === 0) {
    return process.nextTick(callback);
  }

  let completed = 0, hasErrors = false;

  function done(err) {
    if(err) {
      hasErrors = true;
      return callback(err);
    }
    if(++completed === links.length && !hasErrors) {
      return callback();
    }
  }

  links.forEach(function(link) {
    spider(link, nesting - 1, done);
  });

}