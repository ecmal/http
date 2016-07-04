export class Message {
  public rsv1:boolean;
  public rsv2:boolean;
  public rsv3:boolean;
  public opcode:number;
  public length:number;
  public data:Buffer;
  private _chunks:any[];
  constructor() {
    this.rsv1    = false;
    this.rsv2    = false;
    this.rsv3    = false;
    this.opcode  = null;
    this.length  = 0;
    this._chunks = [];
  }
  read() {
    if (this.data) return this.data;

    this.data  = new Buffer(this.length);
    var offset = 0;

    for (var i = 0, n = this._chunks.length; i < n; i++) {
      this._chunks[i].copy(this.data, offset);
      offset += this._chunks[i].length;
    }
    return this.data;
  }
  pushFrame(frame) {
      this.rsv1 = this.rsv1 || frame.rsv1;
      this.rsv2 = this.rsv2 || frame.rsv2;
      this.rsv3 = this.rsv3 || frame.rsv3;

      if (this.opcode === null) this.opcode = frame.opcode;

      this._chunks.push(frame.payload);
      this.length += frame.length;
    }
}

