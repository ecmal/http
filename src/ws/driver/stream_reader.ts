
export class StreamReader {

  private _queue:any[];
  private _queueSize:number;
  private _offset:number;

  public constructor() {
    this._queue     = [];
    this._queueSize = 0;
    this._offset    = 0;
  }

  public put(buffer) {
    if (!buffer || buffer.length === 0) return;
    if (!buffer.copy) buffer = new Buffer(buffer);
    this._queue.push(buffer);
    this._queueSize += buffer.length;
  }

  public read(length) {
    if (length > this._queueSize) return null;
    if (length === 0) return new Buffer(0);

    this._queueSize -= length;

    var queue  = this._queue,
        remain = length,
        first  = queue[0],
        buffers, buffer;

    if (first.length >= length) {
      if (first.length === length) {
        return queue.shift();
      } else {
        buffer = first.slice(0, length);
        queue[0] = first.slice(length);
        return buffer;
      }
    }

    for (var i = 0, n = queue.length; i < n; i++) {
      if (remain < queue[i].length) break;
      remain -= queue[i].length;
    }
    buffers = queue.splice(0, i);

    if (remain > 0 && queue.length > 0) {
      buffers.push(queue[0].slice(0, remain));
      queue[0] = queue[0].slice(remain);
    }
    return this._concat(buffers, length);
  }

  public eachByte(callback, context) {
    var buffer, n, index;

    while (this._queue.length > 0) {
      buffer = this._queue[0];
      n = buffer.length;

      while (this._offset < n) {
        index = this._offset;
        this._offset += 1;
        callback.call(context, buffer[index]);
      }
      this._offset = 0;
      this._queue.shift();
    }
  }

  private _concat(buffers, length) {
    if (Buffer.concat) return Buffer.concat(buffers, length);
    var buffer = new Buffer(length),
        offset = 0;
    for (var i = 0, n = buffers.length; i < n; i++) {
      buffers[i].copy(buffer, offset);
      offset += buffers[i].length;
    }
    return buffer;
  }

}