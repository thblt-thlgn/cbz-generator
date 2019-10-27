const { Worker, workerData, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  throw new Error('Cannot be called as a script');
}

console.log(workerData.message, workerData.func(1));

parentPort.once('message', message => {
  parentPort.postMessage(message);
});
