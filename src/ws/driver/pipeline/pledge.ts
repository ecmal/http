import {RingBuffer} from "./ring_buffer";

export class Pledge {

  static QUEUE_SIZE = 4;
  static all(list) {
    var pledge  = new Pledge(),
        pending = list.length,
        n       = pending;

    if (pending === 0) pledge.done();

    while (n--) list[n].then(function() {
      pending -= 1;
      if (pending === 0) pledge.done();
    });
    return pledge;
  }

  protected _complete;
  private _callbacks;
  public constructor() {
    this._complete  = false;
    this._callbacks = new RingBuffer(Pledge.QUEUE_SIZE);
  }
  public then(callback) {
    if (this._complete) callback();
    else this._callbacks.push(callback);
  }
  public done() {
    this._complete = true;
    var callbacks = this._callbacks, callback;
    while (callback = callbacks.shift()) callback();
  }
}

