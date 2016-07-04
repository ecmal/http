import {Common} from './common';
import {Session} from './session';


export class ServerSession extends Session{
  static validParams(params) {
    if (!Common.validParams(params)) return false;
    if (params.hasOwnProperty('client_max_window_bits')) {
      if(params.client_max_window_bits===true){
        return true;
      } else
      if (Common.VALID_WINDOW_BITS.indexOf(params.client_max_window_bits) < 0){
          return false;
      }
    }
    return true;
  }
  protected _params;
  constructor(options, params) {
    super(options);
    this._params = params;
  }
  public generateResponse() {
    var response:any = {};

    // https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression#section-8.1.1.1

    this._ownContextTakeover = !this._acceptNoContextTakeover &&
        !this._params.server_no_context_takeover;

    if (!this._ownContextTakeover) response.server_no_context_takeover = true;

    // https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression#section-8.1.1.2

    this._peerContextTakeover = !this._requestNoContextTakeover &&
        !this._params.client_no_context_takeover;

    if (!this._peerContextTakeover) response.client_no_context_takeover = true;

    // https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression#section-8.1.2.1

    this._ownWindowBits = Math.min(this._acceptMaxWindowBits || Common.MAX_WINDOW_BITS,
        this._params.server_max_window_bits || Common.MAX_WINDOW_BITS);

    // In violation of the spec, Firefox closes the connection if it does not
    // send server_max_window_bits but the server includes this in its response
    if (this._ownWindowBits < Common.MAX_WINDOW_BITS && this._params.server_max_window_bits)
      response.server_max_window_bits = this._ownWindowBits;

    // https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression#section-8.1.2.2

    var clientMax = this._params.client_max_window_bits, requestMax;
    if (clientMax) {
      if (clientMax === true) clientMax = Common.MAX_WINDOW_BITS;
      this._peerWindowBits = Math.min(this._requestMaxWindowBits || Common.MAX_WINDOW_BITS, clientMax);
    } else {
      this._peerWindowBits = Common.MAX_WINDOW_BITS;
    }

    if (this._peerWindowBits < Common.MAX_WINDOW_BITS)
      response.client_max_window_bits = this._peerWindowBits;

    return response;
  }
}

