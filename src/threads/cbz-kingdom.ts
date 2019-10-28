import * as cheerio from 'cheerio';
import * as path from 'path';
import axios from 'axios';
import { Chapter } from 'src/downloaders/kingdom';
import { ThreadOutput } from './base-thread';
import { CBZGenerator } from './cbz-generator';

const ROOT_DIR = path.resolve();
const DOWNLOAD_LOCATION = `${ROOT_DIR}/download/kingdom`;
const CBR_LOCATION = `${ROOT_DIR}/ebook/kingdom`;

class CBZKingdom extends CBZGenerator {
  constructor() {
    super();
    this.createDir(DOWNLOAD_LOCATION);
    this.createDir(CBR_LOCATION);
  }

  async process(chapter: Chapter): Promise<ThreadOutput> {
    const downloadFolder = `${DOWNLOAD_LOCATION}/${chapter.chapter}`;
    const cbrLocation = `${CBR_LOCATION}/${chapter.title}.cbz`;
    const urls = await this.retrieveImageURLs(chapter);

    const downloadImages = urls.map((url, index) =>
      this.downloadImage({
        url,
        directory: downloadFolder,
        fileName: `${this.prefixNumber(index, 2)}.png`,
      }),
    );
    await Promise.all(downloadImages);

    await this.generateCBR({
      cbrLocation,
      imageDirectory: downloadFolder,
    });

    this.removeDir(downloadFolder);

    return {
      chapter,
      urls,
      cbrLocation,
      threadId: this.threadId,
    };
  }

  private async retrieveImageURLs(chapter: Chapter): Promise<string[]> {
    const { data } = await axios.get(chapter.url);
    const $ = cheerio.load(data);
    const tags = $('#all > .img-responsive');

    return Object.entries(tags).reduce(
      (accumulator, [key, value]) => {
        if (isNaN(parseInt(key, 10))) {
          return accumulator;
        }

        accumulator.push(value.attribs['data-src'].trim());
        return accumulator;
      },
      [] as string[],
    );
  }
}

new CBZKingdom();
