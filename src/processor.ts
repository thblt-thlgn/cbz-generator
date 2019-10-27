import { EventEmitter } from 'events';

const { Worker, isMainThread } = require('worker_threads');
export class Processor {
  private workers: Worker[] = [];
  private runningWorkers = 0;
  private eventEmitter = new EventEmitter();

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
        this.eventEmitter.emit('itemProcessed', message);
        this.process(worker);
      });

      worker.on('error', (err: Error) => {
        this.eventEmitter.emit('threadError', err);
      });

      worker.on('exit', () => {
        this.runningWorkers -= 1;
        if (this.runningWorkers === 0) {
          this.eventEmitter.emit('end');
        }
      });

      this.workers.push(worker);
    }

    this.workers.forEach(this.process);
  }

  private process = (worker: Worker) => {
    if (this.data.length > 0) {
      worker.postMessage(this.data.shift());
    } else {
      worker.terminate();
    }
  }

  public on(
    eventName: 'itemProcessed' | 'threadError' | 'end',
    listener: (...args: any[]) => any,
  ) {
    return this.eventEmitter.on(eventName, listener);
  }
}
