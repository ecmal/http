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
import { Stream } from "node/stream";
export declare class IO extends Stream {
    readable: boolean;
    writable: boolean;
    private _driver;
    _paused: boolean;
    private parent;
    constructor(driver: any);
    pause(): void;
    resume(): void;
    write(chunk: any, enc?: any, callback?: any): boolean;
    end(chunk?: any): void;
    destroy(): void;
}
export declare class Messages extends Stream {
    readable: boolean;
    writable: boolean;
    private _driver;
    _paused: boolean;
    constructor(driver: any);
    pause(): void;
    resume(): void;
    write(message: any): boolean;
    end(message: any): void;
    destroy(): void;
}
