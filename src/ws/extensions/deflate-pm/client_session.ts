import {Common} from './common';
import {Session} from './session';


export class ClientSession extends Session {
  static validParams(params) {
    if (!Common.validParams(params)) return false;

    if (params.hasOwnProperty('client_max_window_bits')) {
      if (Common.VALID_WINDOW_BITS.indexOf(params.client_max_window_bits) < 0)
        return false;
    }
    return true;
  }

  constructor(options){
      super(options);
  }
  public generateOffer() {
    var offer:any = {};

    if (this._acceptNoContextTakeover)
      offer.client_no_context_takeover = true;

    if (this._acceptMaxWindowBits !== undefined) {
      if (Common.VALID_WINDOW_BITS.indexOf(this._acceptMaxWindowBits) < 0) {
        throw new Error('Invalid value for maxWindowBits');
      }
      offer.client_max_window_bits = this._acceptMaxWindowBits;
    } else {
      offer.client_max_window_bits = true;
    }

    if (this._requestNoContextTakeover)
      offer.server_no_context_takeover = true;

    if (this._requestMaxWindowBits !== undefined) {
      if (Common.VALID_WINDOW_BITS.indexOf(this._requestMaxWindowBits) < 0) {
        throw new Error('Invalid valud for requestMaxWindowBits');
      }
      offer.server_max_window_bits = this._requestMaxWindowBits;
    }

    return offer;
  }
  public activate(params) {
    if (!ClientSession.validParams(params)) return false;

    if (this._acceptMaxWindowBits && params.client_max_window_bits) {
      if (params.client_max_window_bits > this._acceptMaxWindowBits) return false;
    }

    if (this._requestNoContextTakeover && !params.server_no_context_takeover)
      return false;

    if (this._requestMaxWindowBits) {
      if (!params.server_max_window_bits) return false;
      if (params.server_max_window_bits > this._requestMaxWindowBits) return false;
    }

    this._ownContextTakeover = !(this._acceptNoContextTakeover || params.client_no_context_takeover);
    this._ownWindowBits = Math.min(
        this._acceptMaxWindowBits || Common.MAX_WINDOW_BITS,
        params.client_max_window_bits || Common.MAX_WINDOW_BITS
    );

    this._peerContextTakeover = !params.server_no_context_takeover;
    this._peerWindowBits = params.server_max_window_bits || Common.MAX_WINDOW_BITS;

    return true;
  }
}

