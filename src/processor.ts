import { Readable } from 'stream';

const { Worker, isMainThread } = require('worker_threads');

export class Processor {
  private workers: Worker[] = [];
  private stream: Readable = new Readable({ read: () => {} });
  private status: 'awaiting' | 'running' | 'ended' = 'awaiting';
  private runningWorkers = 0;

  constructor(
    private data: any[],
    private threadName: string,
    private threadCount: number = 1,
  ) {
    if (!isMainThread) {
      throw new Error('Cannot be started from thread');
    }

    for (let i = 0; i < this.threadCount; i += 1) {
      const worker = new Worker(`${__dirname}/threads/${this.threadName}.js`, {
        workerData: 'test',
      });

      this.runningWorkers += 1;

      worker.on('message', (message: any) => {
        this.stream.push(JSON.stringify(message));
        this.process(worker);
      });

      worker.on('error', console.error);
      worker.on('exit', () => {
        console.log('exit worker');
        this.runningWorkers -= 1;
        if (this.runningWorkers === 0) {
          this.stream.push(null);
          this.status = 'ended';
        }
      });

      this.workers.push(worker);
    }
  }

  private process = (worker: Worker) => {
    if (this.data.length > 0) {
      worker.postMessage(this.data.shift());
    } else if (this.status === 'running') {
      worker.terminate();
    }
  }

  public start(): Readable {
    if (this.status === 'awaiting') {
      this.workers.forEach(this.process);
      this.status = 'running';
    }
    return this.stream;
  }
}
