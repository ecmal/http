/**

 Streams in a WebSocket connection
 ---------------------------------

 We model a WebSocket as two duplex streams: one stream is for the wire protocol
 over an I/O socket, and the other is for incoming/outgoing messages.


 +----------+      +---------+      +----------+
 [1] write(chunk) -->| ~~~~~~~~ +----->| parse() +----->| ~~~~~~~~ +--> emit('data') [2]
 |          |      +----+----+      |          |
 |          |           |           |          |
 |    IO    |           | [5]       | Messages |
 |          |           V           |          |
 |          |      +---------+      |          |
 [4] emit('data') <--+ ~~~~~~~~ |<-----+ frame() |<-----+ ~~~~~~~~ |<-- write(chunk) [3]
 +----------+      +---------+      +----------+


 Message transfer in each direction is simple: IO receives a byte stream [1] and
 sends this stream for parsing. The parser will periodically emit a complete
 message text on the Messages stream [2]. Similarly, when messages are written
 to the Messages stream [3], they are framed using the WebSocket wire format and
 emitted via IO [4].

 There is a feedback loop via [5] since some input from [1] will be things like
 ping, pong and close frames. In these cases the protocol responds by emitting
 responses directly back to [4] rather than emitting messages via [2].

 For the purposes of flow control, we consider the sources of each Readable
 stream to be as follows:

 * [2] receives input from [1]
 * [4] receives input from [1] and [3]

 The classes below express the relationships described above without prescribing
 anything about how parse() and frame() work, other than assuming they emit
 'data' events to the IO and Messages streams. They will work with any protocol
 driver having these two methods.
 **/
import {Stream} from "node/stream";
import {Base} from "./base";
export class IO extends Stream {

    public readable:boolean;
    public writable:boolean;
    private _driver:Base;
    public _paused:boolean;
    private parent:Stream;
    public constructor(driver) {
        super();
        this.readable = this.writable = true;
        this._paused = false;
        this._driver = driver;
        this.on('pipe',(stream)=>{
            this.parent = stream
        })
    }

    public pause() {
        this._paused = true;
        this._driver.messages._paused = true;
    }
    public resume() {
        this._paused = false;
        this.emit('drain');
        let messages = this._driver.messages;
        messages._paused = false;
        messages.emit('drain');
    }
    public write(chunk,enc?,callback?) {
        if (!this.writable) {
            return false;
        }
        this._driver.parse(chunk);
        return !this._paused;
    }
    public end(chunk?) {
        if (!this.writable) return;
        if (chunk !== undefined) this.write(chunk);
        this.writable = false;
        let messages = this._driver.messages;
        if (messages.readable) {
            messages.readable = messages.writable = false;
            messages.emit('end');
        }
    }
    public destroy() {
        this.end();
    }
}
export class Messages extends Stream {
    public readable:boolean;
    public writable:boolean;
    private _driver:Base;
    public _paused:boolean;

    constructor(driver) {
        super();
        this.readable = this.writable = true;
        this._paused = false;
        this._driver = driver;
    }
    public pause() {
        //console.info("Messages.PAUSE");
        this._driver.io._paused = true;
    }
    public resume() {
        //console.info("Messages.RESUME");
        this._driver.io._paused = false;
        this._driver.io.emit('drain');
    }
    public write(message) {
        //console.info("Messages.write",message);
        if (!this.writable){
            return false;
        }
        if (typeof message === 'string'){
            this._driver.text(message);
        }else {
            this._driver.binary(message);
        }
        return !this._paused;
    }
    public end(message) {
        if (message !== undefined){
            this.write(message);
        }
    }
    public destroy() {}
}



