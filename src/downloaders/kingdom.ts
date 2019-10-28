import axios from 'axios';
import * as cheerio from 'cheerio';
import { Processor } from '../processor';

const CHAPTER_URL = 'https://www.scan-fr.co/manga/kingdom';

export interface Chapter {
  chapter: number;
  title: string;
  url: string;
}

const retrieveChapters = async (): Promise<Chapter[]> => {
  const { data } = await axios(`${CHAPTER_URL}/1`);
  const $ = cheerio.load(data);
  const tags = $('#chapter-list > ul > li > a');
  return Object.entries(tags).reduce(
    (accumulator, [key, value]) => {
      const chapter = parseInt(key, 10);
      if (isNaN(chapter)) {
        return accumulator;
      }

      accumulator.push({
        chapter,
        title: value.children[0].data || `${chapter}`,
        url: value.attribs.href,
      });
      return accumulator;
    },
    [] as Chapter[],
  );
};

export const start = async () => {
  const chapters = await retrieveChapters();
  const processor = new Processor(chapters.slice(0, 20), 'cbz-kingdom', 5);

  processor.on('itemProcessed', data => {
    console.log(`success - ${data.chapter.title} - thread ${data.threadId}`);
  });
  processor.on('threadError', error => {
    console.error(error);
  });
  processor.on('end', () => {
    console.log('end');
  });
};
