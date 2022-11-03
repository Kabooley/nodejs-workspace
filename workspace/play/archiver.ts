/***********************************************
 * Read file from stream and save as archived file
 * by using arvhiver module.
 * 
 * https://www.npmjs.com/package/archiver
 * 
 * https://www.archiverjs.com/docs/quickstart
 * 
 * 別件：`Declasation Merging`で型名も関数名も同じ時にどうインポートするべきか
 * *********************************************/ 
import archiver from 'archiver';
import stream from 'stream';


export class Archiver {
    private archive: archiver.Archiver;
    constructor(format: archiver.Format, options?: archiver.ArchiverOptions | undefined) {
        this.archive = archiver(format, options);
    };

    _setListeners(): void {
        this.archive.on('end', this._endHandler);
        this.archive.on('warning', this._warningHandler);
        this.archive.on('error', this._errorHandler);
        this.archive.on('close', this._closeHandler);
    };

    _endHandler(): void {
        console.log("archive: end");
    };

    _warningHandler(): void {
        console.log("archive: warning.");
    };

    _errorHandler(): void {
        console.log("archive: error.");
    };

    _closeHandler(): void {
        console.log("archive: close.");
    };

    // pipe to destination
    setPipe(dest: stream.Writable) {
        this.archive.pipe(dest);
    }

    // streamかbufferか文字列を読み取って圧縮させるとき
    append(
        source: Buffer | stream.Readable | string, 
        data?: archiver.EntryData | archiver.ZipEntryData | undefined): archiver.Archiver {
        return this.archive.append(source, data);
    };

    // ファイルを読み取って圧縮させるとき
    file(filename: string, data: archiver.EntryData): archiver.Archiver {
        return this.archive.file(filename, data);
    };

    // ディレクトリを圧縮させるとき
    directory(
        dirpath: string, destpath: string | false, 
        data?: Partial<archiver.EntryData> | archiver.EntryDataFunction | undefined
        ): archiver.Archiver {
        return this.archive.directory(dirpath, destpath, data);
    };

    // 実行
    finalize(): Promise<void> {
        return this.archive.finalize();
    }
};