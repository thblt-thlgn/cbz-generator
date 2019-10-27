import { Processor } from './processor';

const processor = new Processor(
  [1, 2, 3, 4, 6, 7, 8, 9, 10],
  'cbz-generator',
  5,
);

processor.on('itemProcessed', x => {
  console.log(x);
});
processor.on('threadError', () => {
  console.log('threadError');
});
processor.on('end', () => {
  console.log('end');
});
