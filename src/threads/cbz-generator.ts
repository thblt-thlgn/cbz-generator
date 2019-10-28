import * as fs from 'fs';
import * as archiver from 'archiver';
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
    const filePath = `${directory}/${fileName}`;
    const { data } = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    fs.writeFileSync(filePath, Buffer.from(data, 'binary'));
  }

  protected generateCBR(params: {
    subDirectory: string;
    fileName: string;
    dowloadLocation: string;
  }): Promise<unknown> {
    const { subDirectory, fileName, dowloadLocation } = params;

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(`${dowloadLocation}/${fileName}`);
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(subDirectory, false);
      archive.finalize();
    });
  }

  protected createDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }
}
