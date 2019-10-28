import * as cheerio from 'cheerio';
import axios from 'axios';
import { Chapter } from 'src/downloaders/kingdom';
import { BaseThread, ThreadOutput } from './base-thread';

class CBZKingdom extends BaseThread {
  constructor() {
    super();
  }

  async process(chapter: Chapter): Promise<ThreadOutput> {
    const pages = await this.retrievePageURLs(chapter);
    const urls = await Promise.all(
      pages.map(page => this.retrieveImageUrl(page)),
    );

    return {
      chapter,
      pages,
      urls,
      threadId: this.threadId,
    };
  }

  private async retrievePageURLs(chapter: Chapter): Promise<string[]> {
    const { data } = await axios.get(chapter.url);
    const $ = cheerio.load(data);
    const totalPages = $('#page-list').children().length;
    const pageUrls = [];
    for (let i = 1; i <= totalPages; i += 1) {
      pageUrls.push(`${chapter.url}/${i}`);
    }
    return pageUrls;
  }

  private async retrieveImageUrl(pageUrl: string): Promise<string> {
    const { data } = await axios.get(pageUrl);
    const $ = cheerio.load(data);
    console.log(pageUrl, $('#ppp > a > img')[0]);
    return $('#ppp > a > img')[0].attribs.src;
  }
}

new CBZKingdom();
