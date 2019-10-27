import { BaseThread, ThreadOutput } from './base-thread';

class CBZGenerator extends BaseThread {
  constructor() {
    super();
  }

  process(toProcess: string): Promise<ThreadOutput> {
    const response = {
      threadId: this.threadId,
      message: toProcess,
    };

    return new Promise(resolve => {
      setTimeout(() => resolve(response), 1000);
    });
  }
}

new CBZGenerator();
