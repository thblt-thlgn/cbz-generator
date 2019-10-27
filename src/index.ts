import { Processor } from './processor';

const processor = new Processor(
  [1, 2, 3, 4, 6, 7, 8, 9, 10],
  'cbz-generator',
  5,
);
const stream = processor.start();

stream.on('data', x => {
  console.log(x.toString());
});
stream.on('close', () => {
  console.log('close');
});
stream.on('end', () => {
  console.log('end');
});
