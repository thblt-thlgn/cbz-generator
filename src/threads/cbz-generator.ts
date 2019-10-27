import { BaseThread } from './base-thread';

class CBZGenerator extends BaseThread {
  constructor() {
    super();
  }

  process(toProcess: any) {
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
