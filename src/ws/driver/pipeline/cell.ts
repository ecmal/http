import {Functor} from "./functor";
import {Pledge} from "./pledge";

export class Cell {

  protected _ext;
  protected _session;
  protected _functors;
  protected _closed;

  public constructor(tuple) {
    this._ext     = tuple[0];
    this._session = tuple[1];
    this._functors = {
      incoming: new Functor(this._session, 'processIncomingMessage'),
      outgoing: new Functor(this._session, 'processOutgoingMessage')
    };
  }
  public pending (direction) {
    this._functors[direction].pending += 1;
  }
  public incoming(error, message, callback, context) {
    this._exec('incoming', error, message, callback, context);
  }
  public outgoing(error, message, callback, context) {
    this._exec('outgoing', error, message, callback, context);
  }
  public close() {
    this._closed = this._closed || new Pledge();
    this._doClose();
    return this._closed;
  }
  protected _exec (direction, error, message, callback, context) {
    this._functors[direction].call(error, message, function(err, msg) {
      if (err) err.message = this._ext.name + ': ' + err.message;
      callback.call(context, err, msg);
      this._doClose();
    }, this);
  }
  protected _doClose () {
    var fin  = this._functors.incoming,
        fout = this._functors.outgoing;

    if (!this._closed || fin.pending + fout.pending !== 0) return;
    if (this._session) this._session.close();
    this._session = null;
    this._closed.done();
  }
}

