/*********************************************************
 * Uploader to Dropbox implementing.
 * 
 * 参考：
 * https://louisz.medium.com/sample-code-to-upload-files-into-dropbox-using-nodejs-both-single-upload-and-multi-part-upload-739318f17bf0
 * 
 * ? HTTP APIとJavaScript APIは両方使っていいの？
 * *******************************************************/ 
import { Dropbox, Error, files } from 'dropbox'; // eslint-disable-line no-unused-vars
import fs = require('fs');
import path = require('path');

const prompt = require('prompt');

prompt.start();

prompt.get({
  properties: {
    accessToken: {
      description: 'Please enter an API V2 access token',
    },
  },
}, (error: any, result: any) => {
  const dbx = new Dropbox({ accessToken: result.accessToken });

  fs.readFile(path.join(__dirname, '/basic.js'), 'utf8', (err, contents) => {
    if (err) {
      console.log('Error: ', err);
    }

    // This uploads basic.js to the root of your dropbox
    dbx.filesUpload({ path: '/basic.js', contents })
      .then((response: any) => {
        console.log(response);
      })
      .catch((uploadErr: Error<files.UploadError>) => {
        console.log(uploadErr);
      });
  });
});