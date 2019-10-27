const { Worker, isMainThread } = require('worker_threads');

export class Processor {
  private workers: Worker[] = [];

  constructor(
    private data: any[],
    private threadName: string,
    private threadCount: number = 1,
  ) {
    if (!isMainThread) {
      throw new Error('Cannot be started from thread');
    }

    for (let i = 0; i < threadCount; i += 1) {
      const worker = new Worker(`${__dirname}/threads/${this.threadName}.js`, {
        workerData: 'test',
      });

      worker.on('message', (message: any) => {
        console.log(message);
        this.process(worker);
      });

      worker.on('error', console.error);
      worker.on('exit', console.error);

      this.process(worker);
      this.workers.push(worker);
    }
  }

  private process = (worker: Worker) => {
    if (this.data.length > 0) {
      worker.postMessage(this.data.shift());
    }
  }
}
