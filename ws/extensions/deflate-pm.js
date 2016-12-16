system.register("http/ws/extensions/deflate-pm", ['./deflate-pm/client_session', './deflate-pm/server_session', './deflate-pm/common'], function(system,module,jsx) {
    var client_session_1, server_session_1, common_1;
    var VALID_OPTIONS;
    var PerMessageDeflate = (function (__super) {
        PerMessageDeflate.prototype.configure = function (options) {
            common_1.Common.validateOptions(options, VALID_OPTIONS);
            for (var key in options) {
                this._options[key] = options[key];
            }
        };
        PerMessageDeflate.prototype.createClientSession = function () {
            return new client_session_1.ClientSession(this._options || {});
        };
        PerMessageDeflate.prototype.createServerSession = function (offers) {
            for (var i = 0, n = offers.length; i < n; i++) {
                if (server_session_1.ServerSession.validParams(offers[i])) {
                    return new server_session_1.ServerSession(this._options || {}, offers[i]);
                }
            }
            return null;
        };
        return PerMessageDeflate;
        function PerMessageDeflate(options) {
            this.name = 'permessage-deflate';
            this.type = 'permessage';
            this.rsv1 = true;
            this.rsv2 = false;
            this.rsv3 = false;
            if (options) {
                this.configure(options);
            }
        }
    })();
    module.define('class', PerMessageDeflate);
    module.export("PerMessageDeflate", PerMessageDeflate);
    return {
        setters:[
            function (client_session_1_1) {
                client_session_1 = client_session_1_1;
            },
            function (server_session_1_1) {
                server_session_1 = server_session_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            }],
        execute: function() {
            VALID_OPTIONS = [
                'level',
                'memLevel',
                'strategy',
                'noContextTakeover',
                'maxWindowBits',
                'requestNoContextTakeover',
                'requestMaxWindowBits'
            ];
            PerMessageDeflate = module.init(PerMessageDeflate);
        }
    }
});
//# sourceMappingURL=deflate-pm.js.map