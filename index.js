const axios = require('axios');
const cheerio = require('cheerio');

const CHAPTER_URL = 'https://www.scan-fr.co/manga/kingdom';
// const UPLOAD_URL = 'http://scan-fr.co/uploads/manga/kingdom/chapters';

const retrieveChapters = async () => {
  const { data } = await axios(`${CHAPTER_URL}/1`);
  const $ = cheerio.load(data);
  const tags = $('#chapter-list > ul > li > a');
  return Object.entries(tags).reduce((accumulator, [key, value]) => {
    const chapter = parseInt(key, 10);
    if (isNaN(chapter)) {
      return accumulator;
    }

    accumulator.push({
      chapter,
      title: value.children[0].data,
      url: value.attribs.href,
    });
    return accumulator;
  }, []);
};

const retrievePageURLs = async chapter => {
  const { data } = await axios.get(chapter.url);
  const $ = cheerio.load(data);
  const totalPages = $('#page-list').children().length;
  const pageUrls = [];
  for (let i = 1; i <= totalPages; i += 1) {
    pageUrls.push(`${chapter.url}/${i}`);
  }
  return pageUrls;
};

const retrieveImageUrl = async pageUrl => {
  const { data } = await axios.get(pageUrl);
  const $ = cheerio.load(data);
  return $('#ppp > a > img')[0].attribs.src;
};

const main = async () => {
  const chapters = await retrieveChapters();
  const pages = await retrievePageURLs(chapters[0]);
  console.log(pages);
  const imageUrl = await retrieveImageUrl(pages[0]);
  console.log(imageUrl);
};

main();
// const pages = retrieveFirstPagesURL();
// retrieveImageURLS(pages[0]);
