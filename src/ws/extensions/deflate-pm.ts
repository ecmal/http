import {ClientSession} from './deflate-pm/client_session';
import {ServerSession} from './deflate-pm/server_session';
import {Common} from './deflate-pm/common';

const VALID_OPTIONS = [
    'level',
    'memLevel',
    'strategy',
    'noContextTakeover',
    'maxWindowBits',
    'requestNoContextTakeover',
    'requestMaxWindowBits'
];
export class PerMessageDeflate  {
    public name = 'permessage-deflate';
    public type = 'permessage';
    public rsv1 = true;
    public rsv2 = false;
    public rsv3 = false;
    private _options;
    public constructor(options?){
        if(options){
            this.configure(options)
        }
    }
    public configure(options) {
        Common.validateOptions(options, VALID_OPTIONS);
        for (let key in options) {
            this._options[key] = options[key];
        }
    }
    public createClientSession() {
        return new ClientSession(this._options || {});
    }
    public createServerSession(offers) {
        for (var i = 0, n = offers.length; i < n; i++) {
            if (ServerSession.validParams(offers[i])){
                return new ServerSession(this._options || {}, offers[i]);
            }
        }
        return null;
    }
}

