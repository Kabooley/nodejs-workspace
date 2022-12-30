import type * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import type * as http from 'http';
import type { iIllustData } from '../typeOfArtworkPage';
import type { iDownloadOptionGenerator } from '../../../action';
import type { StreamOptions } from '../../../action/Action';


/***
 * Action.download()の必須引数を生成する関数。
 * 
 * NOTE: `iIllustData`に特化したハードコード内容である。
 * 
 * */ 
export const generateDownloadOptions: iDownloadOptionGenerator<iIllustData> = (data) => {
    const { urls, illustTitle } = data;
    if(urls === undefined || illustTitle === undefined || urls.original === undefined) 
        throw new Error("Error: No expected data was contained in data.");
    
    const _url: URL = new url.URL(urls.original);
    const filepath: fs.PathLike = path.join(__dirname, illustTitle, path.extname(urls.original));
    const httpRequestOption: http.RequestOptions = {
        method: "GET",
        host: _url.host,
        path: _url.pathname,
        protocol: "https"
    };
    const options: StreamOptions = {
        encoding: 'binary',
        autoClose: true,
        emitClose: true,
        highWaterMark: 1024
    };

    return {dest: filepath, httpRequestOption: httpRequestOption, options: options};
};
