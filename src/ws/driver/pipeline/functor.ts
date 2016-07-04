import {RingBuffer} from "./ring_buffer";

export class Functor {
  static QUEUE_SIZE = 8;

  public pending;
  protected _session;
  protected _method;
  protected _queue;
  protected _stopped;

  constructor(session, method) {
    this._session = session;
    this._method  = method;
    this._queue   = new RingBuffer(Functor.QUEUE_SIZE);
    this._stopped = false;
    this.pending  = 0;
  }
  public call(error, message, callback, context) {
    if (this._stopped) return;

    var record = {error: error, message: message, callback: callback, context: context, done: false},
        called = false,
        self   = this;

    this._queue.push(record);

    if (record.error) {
      record.done = true;
      this._stop();
      return this._flushQueue();
    }

    this._session[this._method](message, function(err, msg) {
      if (called === (called = true)){
        return;
      }
      if (err) {
        self._stop();
        record.error   = err;
        record.message = null;
      } else {
        record.message = msg;
      }
      record.done = true;
      self._flushQueue();
    });
  }
  protected _stop() {
    this.pending  = this._queue.length;
    this._stopped = true;
  }
  protected _flushQueue() {
    var queue = this._queue, record;

    while (queue.length > 0 && queue.peek().done) {
      this.pending -= 1;
      record = queue.shift();
      record.callback.call(record.context, record.error, record.message);
    }
  }
}




