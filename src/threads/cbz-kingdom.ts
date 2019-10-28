import * as cheerio from 'cheerio';
import axios from 'axios';
import { Chapter } from 'src/downloaders/kingdom';
import { BaseThread, ThreadOutput } from './base-thread';

class CBZKingdom extends BaseThread {
  constructor() {
    super();
  }

  async process(chapter: Chapter): Promise<ThreadOutput> {
    const urls = await this.retrieveImageURLs(chapter);

    return {
      chapter,
      urls,
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

        accumulator.push(value.attribs['data-src']);
        return accumulator;
      },
      [] as string[],
    );
  }
}

new CBZKingdom();
