import * as fs from 'fs';
import * as archiver from 'archiver';
import axios from 'axios';

export const downloadImage = async (
  url: string,
  directory: string,
  fileName: string,
) => {
  const filePath = `${directory}/${fileName}`;
  const { data } = await axios.get(url, {
    responseType: 'arraybuffer',
  });
  fs.writeFileSync(filePath, Buffer.from(data, 'binary'));
};

export const generateCBR = (
  subDirectory: string,
  fileName: string,
  dowloadLocation: string,
) =>
  new Promise((resolve, reject) => {
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

export const createDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};
