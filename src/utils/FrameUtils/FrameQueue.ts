export class FrameQueue {
  queue: unknown[];
  maxLength: number;

  constructor(maxLength: number) {
    this.queue = [];
    this.maxLength = maxLength;
  }

  needsMore() {
    return this.queue.length < this.maxLength;
  }

  empty() {
    return !this.queue.length;
  }

  push(element: any) {
    return this.queue.push(element);
  }

  shift() {
    return this.queue.length ? this.queue.shift() : null;
  }
}
