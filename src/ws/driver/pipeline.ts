import {Cell} from "./pipeline/cell"
import {Pledge} from "./pipeline/pledge"

export class Pipeline {
  private _cells;
  private _stopped;
  public constructor(sessions) {
    this._cells   = sessions.map((session)=>{
        return new Cell(session)
    });
    this._stopped = {
      incoming : false,
      outgoing : false
    };
  }
  public processIncomingMessage(message, callback, context) {
    //console.info('incoming',message.opcode,message.length);
    if (this._stopped.incoming){
      return;
    }
    this._loop('incoming', this._cells.length - 1, -1, -1, message, callback, context);
  }
  public processOutgoingMessage(message, callback, context) {
    //console.info('outgoing',message.opcode,message.length);
    if (this._stopped.outgoing){
      return;
    }
    this._loop('outgoing', 0, this._cells.length, 1, message, callback, context);
  }
  public close(callback, context) {
    this._stopped = {incoming: true, outgoing: true};
    var closed = this._cells.map(function(a) { return a.close() });
    if (callback) {
      Pledge.all(closed).then(function () {
        callback.call(context)
      });
    }
  }
  protected _loop (direction, start, end, step, message, callback, context) {
    let cells = this._cells,n=cells.length;
    while (n--){
      cells[n].pending(direction);
    }
    let pipe = (index, error, msg)=>{
      if (index === end){
        return callback.call(context, error, msg);
      }
      cells[index][direction](error, msg, (err, m)=>{
        if (err) {
          this._stopped[direction] = true;
        }
        pipe(index + step, err, m);
      });
    };
    pipe(start, null, message);
  }
}

