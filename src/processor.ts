import { EventEmitter } from 'events';
import { ThreadOutput } from './threads/base-thread';

const { Worker, isMainThread } = require('worker_threads');
export class Processor {
  public runningThreads = 0;

  private workers: Worker[] = [];
  private eventEmitter = new EventEmitter();

  constructor(
    public data: any[],
    public threadName: string,
    public threadCount: number = 1,
  ) {
    if (!isMainThread) {
      throw new Error('Cannot be started from thread');
    }

    for (let i = 0; i < this.threadCount; i += 1) {
      const worker = new Worker(`${__dirname}/threads/${this.threadName}.js`, {
        workerData: 'test',
      });

      this.runningThreads += 1;

      worker.on('message', (output: ThreadOutput) => {
        this.eventEmitter.emit('itemProcessed', output);
        this.process(worker);
      });

      worker.on('error', (err: Error) => {
        this.eventEmitter.emit('threadError', err);
      });

      worker.on('exit', () => {
        this.runningThreads -= 1;
        if (this.runningThreads === 0) {
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
  ): EventEmitter {
    return this.eventEmitter.on(eventName, listener);
  }
}
