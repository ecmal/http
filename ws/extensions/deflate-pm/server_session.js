system.register("http/ws/extensions/deflate-pm/server_session", ['./common', './session'], function(system,module,jsx) {
    var common_1, session_1;
    var ServerSession = (function (__super) {
        ServerSession.validParams = function (params) {
            if (!common_1.Common.validParams(params))
                return false;
            if (params.hasOwnProperty('client_max_window_bits')) {
                if (params.client_max_window_bits === true) {
                    return true;
                }
                else if (common_1.Common.VALID_WINDOW_BITS.indexOf(params.client_max_window_bits) < 0) {
                    return false;
                }
            }
            return true;
        };
        ServerSession.prototype.generateResponse = function () {
            var response = {};
            // https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression#section-8.1.1.1
            this._ownContextTakeover = !this._acceptNoContextTakeover &&
                !this._params.server_no_context_takeover;
            if (!this._ownContextTakeover)
                response.server_no_context_takeover = true;
            // https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression#section-8.1.1.2
            this._peerContextTakeover = !this._requestNoContextTakeover &&
                !this._params.client_no_context_takeover;
            if (!this._peerContextTakeover)
                response.client_no_context_takeover = true;
            // https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression#section-8.1.2.1
            this._ownWindowBits = Math.min(this._acceptMaxWindowBits || common_1.Common.MAX_WINDOW_BITS, this._params.server_max_window_bits || common_1.Common.MAX_WINDOW_BITS);
            // In violation of the spec, Firefox closes the connection if it does not
            // send server_max_window_bits but the server includes this in its response
            if (this._ownWindowBits < common_1.Common.MAX_WINDOW_BITS && this._params.server_max_window_bits)
                response.server_max_window_bits = this._ownWindowBits;
            // https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression#section-8.1.2.2
            var clientMax = this._params.client_max_window_bits, requestMax;
            if (clientMax) {
                if (clientMax === true)
                    clientMax = common_1.Common.MAX_WINDOW_BITS;
                this._peerWindowBits = Math.min(this._requestMaxWindowBits || common_1.Common.MAX_WINDOW_BITS, clientMax);
            }
            else {
                this._peerWindowBits = common_1.Common.MAX_WINDOW_BITS;
            }
            if (this._peerWindowBits < common_1.Common.MAX_WINDOW_BITS)
                response.client_max_window_bits = this._peerWindowBits;
            return response;
        };
        ServerSession.__initializer = function(__parent){
            __super=__parent;
        };
        return ServerSession;
        function ServerSession(options, params) {
            __super.call(this, options);
            this._params = params;
        }
    })();
    module.define('class', ServerSession);
    module.export("ServerSession", ServerSession);
    return {
        setters:[
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (session_1_1) {
                session_1 = session_1_1;
            }],
        execute: function() {
            ServerSession = module.init(ServerSession,session_1.Session);
        }
    }
});
//# sourceMappingURL=server_session.js.map