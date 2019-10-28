import * as cheerio from 'cheerio';
import * as path from 'path';
import axios from 'axios';
import { Chapter } from 'src/downloaders/kingdom';
import { ThreadOutput } from './base-thread';
import { CBZGenerator } from './cbz-generator';

const MAX_RETRY = 3;
const ROOT_DIR = path.resolve();
const DOWNLOAD_LOCATION = `${ROOT_DIR}/download/kingdom`;
const CBR_LOCATION = `${ROOT_DIR}/ebook/kingdom`;

class CBZKingdom extends CBZGenerator {
  constructor() {
    super();
    this.createDir(DOWNLOAD_LOCATION);
    this.createDir(CBR_LOCATION);
  }

  async process(chapter: Chapter): Promise<Object> {
    return this.retryPolicy(chapter, MAX_RETRY);
  }

  private async retryPolicy(
    chapter: Chapter,
    tryCounts: number,
  ): Promise<Object> {
    try {
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
      };
    } catch (e) {
      if (tryCounts > 0) {
        const retry = MAX_RETRY - tryCounts + 1;
        console.error(
          `error - ${chapter.title} - retry ${retry} / ${MAX_RETRY}`,
        );
        console.error(e.message);
        return this.retryPolicy(chapter, tryCounts - 1);
      }

      throw e;
    }
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
