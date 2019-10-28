import * as fs from 'fs';
import * as archiver from 'archiver';
import * as rimraf from 'rimraf';
import axios from 'axios';
import { BaseThread } from './base-thread';

export abstract class CBZGenerator extends BaseThread {
  constructor() {
    super();
  }

  protected async downloadImage(params: {
    url: string;
    directory: string;
    fileName: string;
  }) {
    const { url, directory, fileName } = params;
    this.createDir(directory);
    const filePath = `${directory}/${fileName}`;
    const { data } = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    fs.writeFileSync(filePath, Buffer.from(data, 'binary'));
  }

  protected generateCBR(params: {
    imageDirectory: string;
    cbrLocation: string;
  }): Promise<unknown> {
    const { imageDirectory, cbrLocation } = params;

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(cbrLocation);
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(imageDirectory, false);
      archive.finalize();
    });
  }

  protected createDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  protected removeDir(dir: string): void {
    rimraf.sync(dir);
  }

  protected prefixNumber(
    number: number | string,
    expectedLenght: number,
  ): string {
    const asString = String(number);
    return asString.length < expectedLenght
      ? this.prefixNumber(`0${asString}`, expectedLenght)
      : asString;
  }
}
