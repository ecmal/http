system.register("http/ws/extensions/deflate-pm/client_session", ['./common', './session'], function(system,module,jsx) {
    var common_1, session_1;
    var ClientSession = (function (__super) {
        ClientSession.validParams = function (params) {
            if (!common_1.Common.validParams(params))
                return false;
            if (params.hasOwnProperty('client_max_window_bits')) {
                if (common_1.Common.VALID_WINDOW_BITS.indexOf(params.client_max_window_bits) < 0)
                    return false;
            }
            return true;
        };
        ClientSession.prototype.generateOffer = function () {
            var offer = {};
            if (this._acceptNoContextTakeover)
                offer.client_no_context_takeover = true;
            if (this._acceptMaxWindowBits !== undefined) {
                if (common_1.Common.VALID_WINDOW_BITS.indexOf(this._acceptMaxWindowBits) < 0) {
                    throw new Error('Invalid value for maxWindowBits');
                }
                offer.client_max_window_bits = this._acceptMaxWindowBits;
            }
            else {
                offer.client_max_window_bits = true;
            }
            if (this._requestNoContextTakeover)
                offer.server_no_context_takeover = true;
            if (this._requestMaxWindowBits !== undefined) {
                if (common_1.Common.VALID_WINDOW_BITS.indexOf(this._requestMaxWindowBits) < 0) {
                    throw new Error('Invalid valud for requestMaxWindowBits');
                }
                offer.server_max_window_bits = this._requestMaxWindowBits;
            }
            return offer;
        };
        ClientSession.prototype.activate = function (params) {
            if (!ClientSession.validParams(params))
                return false;
            if (this._acceptMaxWindowBits && params.client_max_window_bits) {
                if (params.client_max_window_bits > this._acceptMaxWindowBits)
                    return false;
            }
            if (this._requestNoContextTakeover && !params.server_no_context_takeover)
                return false;
            if (this._requestMaxWindowBits) {
                if (!params.server_max_window_bits)
                    return false;
                if (params.server_max_window_bits > this._requestMaxWindowBits)
                    return false;
            }
            this._ownContextTakeover = !(this._acceptNoContextTakeover || params.client_no_context_takeover);
            this._ownWindowBits = Math.min(this._acceptMaxWindowBits || common_1.Common.MAX_WINDOW_BITS, params.client_max_window_bits || common_1.Common.MAX_WINDOW_BITS);
            this._peerContextTakeover = !params.server_no_context_takeover;
            this._peerWindowBits = params.server_max_window_bits || common_1.Common.MAX_WINDOW_BITS;
            return true;
        };
        ClientSession.__initializer = function(__parent){
            __super=__parent;
        };
        return ClientSession;
        function ClientSession(options) {
            __super.call(this, options);
        }
    })();
    module.define('class', ClientSession);
    module.export("ClientSession", ClientSession);
    return {
        setters:[
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (session_1_1) {
                session_1 = session_1_1;
            }],
        execute: function() {
            ClientSession = module.init(ClientSession,session_1.Session);
        }
    }
});
//# sourceMappingURL=client_session.js.map