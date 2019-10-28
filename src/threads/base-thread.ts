import { workerData, isMainThread, parentPort, threadId } from 'worker_threads';

export interface ThreadOutput {
  threadId: number;
  [key: string]: any;
}

export abstract class BaseThread {
  protected data = workerData;
  protected threadId = threadId;

  constructor() {
    if (isMainThread) {
      throw new Error('Cannot be called as a script');
    }

    parentPort!.on('message', async (value: any) => {
      try {
        const result = await this.process(value);
        parentPort!.postMessage({
          ...result,
          threadId: this.threadId,
        });
      } catch (e) {
        parentPort!.postMessage({
          error: e,
          threadId: this.threadId,
        });
      }
    });
  }

  protected abstract async process(toProcess: unknown): Promise<Object>;
}
