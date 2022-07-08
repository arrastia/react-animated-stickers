import { isSafari } from '../../utils/LottieUtils';

export class QueryableWorker {
  defaultListener: any;
  listeners: any[];
  worker: Worker;

  constructor(url?: any, defaultListener?: any, onError?: any) {
    this.worker = new Worker(url);
    this.listeners = [];

    this.defaultListener = defaultListener || function() {};
    if (onError) {
      this.worker.onerror = onError;
    }

    this.worker.onmessage = event => {
      if (event.data instanceof Object && event.data.hasOwnProperty('queryMethodListener') && event.data.hasOwnProperty('queryMethodArguments')) {
        this.listeners[event.data.queryMethodListener].apply(this, event.data.queryMethodArguments);
      } else {
        this.defaultListener.call(this, event.data);
      }
    };
  }

  postMessage(message: any) {
    this.worker.postMessage(message);
  }

  terminate() {
    this.worker.terminate();
  }

  addListener(name: any, listener: any) {
    this.listeners[name] = listener;
  }

  removeListener(name: any) {
    delete this.listeners[name];
  }

  /*
    This functions takes at least one argument, the method name we want to query.
    Then we can pass in the arguments that the method needs.
  */
  sendQuery(queryMethod: any) {
    if (arguments.length < 1) {
      throw new TypeError('QueryableWorker.sendQuery takes at least one argument');
    }

    queryMethod = arguments[0];
    const args = Array.prototype.slice.call(arguments, 1);

    if (isSafari()) {
      this.worker.postMessage({ queryMethod: queryMethod, queryMethodArguments: args });
    } else {
      const transfer = [];

      for (let i = 0; i < args.length; i++) {
        if (args[i] === undefined) continue;

        if (args[i] instanceof ArrayBuffer) transfer.push(args[i]);

        if (args[i].buffer && args[i].buffer instanceof ArrayBuffer) transfer.push(args[i].buffer);
      }

      this.worker.postMessage({ queryMethod: queryMethod, queryMethodArguments: args }, transfer);
    }
  }
}
