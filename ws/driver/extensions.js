system.register("http/ws/driver/extensions", ["./hybi/frame", "./exts_parser", "./pipeline"], function(system,module,jsx) {
    var frame_1, exts_parser_1, pipeline_1;
    var Extensions = (function (__super) {
        Extensions.prototype.add = function (ext) {
            if (typeof ext.name !== 'string')
                throw new TypeError('extension.name must be a string');
            if (ext.type !== 'permessage')
                throw new TypeError('extension.type must be "permessage"');
            if (typeof ext.rsv1 !== 'boolean')
                throw new TypeError('extension.rsv1 must be true or false');
            if (typeof ext.rsv2 !== 'boolean')
                throw new TypeError('extension.rsv2 must be true or false');
            if (typeof ext.rsv3 !== 'boolean')
                throw new TypeError('extension.rsv3 must be true or false');
            if (this._byName.hasOwnProperty(ext.name))
                throw new TypeError('An extension with name "' + ext.name + '" is already registered');
            this._byName[ext.name] = ext;
            this._inOrder.push(ext);
        };
        Extensions.prototype.generateOffer = function () {
            var sessions = [], offer = [], index = {};
            this._inOrder.forEach(function (ext) {
                var session = ext.createClientSession();
                if (!session)
                    return;
                var record = [ext, session];
                sessions.push(record);
                index[ext.name] = record;
                var offers = session.generateOffer();
                offers = offers ? [].concat(offers) : [];
                offers.forEach(function (off) {
                    offer.push(exts_parser_1.Parser.serializeParams(ext.name, off));
                }, this);
            }, this);
            this._sessions = sessions;
            this._index = index;
            return offer.length > 0 ? offer.join(', ') : null;
        };
        Extensions.prototype.activate = function (header) {
            var responses = exts_parser_1.Parser.parseHeader(header), sessions = [];
            responses.eachOffer(function (name, params) {
                var record = this._index[name];
                if (!record)
                    throw new Error('Server sent an extension response for unknown extension "' + name + '"');
                var ext = record[0], session = record[1], reserved = this._reserved(ext);
                if (reserved)
                    throw new Error('Server sent two extension responses that use the RSV' +
                        reserved[0] + ' bit: "' +
                        reserved[1] + '" and "' + ext.name + '"');
                if (session.activate(params) !== true)
                    throw new Error('Server sent unacceptable extension parameters: ' +
                        exts_parser_1.Parser.serializeParams(name, params));
                this._reserve(ext);
                sessions.push(record);
            }, this);
            this._sessions = sessions;
            this._pipeline = new pipeline_1.Pipeline(sessions);
        };
        Extensions.prototype.generateResponse = function (header) {
            var offers = exts_parser_1.Parser.parseHeader(header), sessions = [], response = [];
            this._inOrder.forEach(function (ext) {
                var offer = offers.byName(ext.name);
                if (offer.length === 0 || this._reserved(ext))
                    return;
                var session = ext.createServerSession(offer);
                if (!session)
                    return;
                this._reserve(ext);
                sessions.push([ext, session]);
                response.push(exts_parser_1.Parser.serializeParams(ext.name, session.generateResponse()));
            }, this);
            this._sessions = sessions;
            this._pipeline = new pipeline_1.Pipeline(sessions);
            return response.length > 0 ? response.join(', ') : null;
        };
        Extensions.prototype.validFrameRsv = function (frame) {
            var allowed = { rsv1: false, rsv2: false, rsv3: false }, ext;
            if (Extensions.MESSAGE_OPCODES.indexOf(frame.opcode) >= 0) {
                for (var i = 0, n = this._sessions.length; i < n; i++) {
                    ext = this._sessions[i][0];
                    allowed.rsv1 = allowed.rsv1 || ext.rsv1;
                    allowed.rsv2 = allowed.rsv2 || ext.rsv2;
                    allowed.rsv3 = allowed.rsv3 || ext.rsv3;
                }
            }
            return (allowed.rsv1 || !frame.rsv1) &&
                (allowed.rsv2 || !frame.rsv2) &&
                (allowed.rsv3 || !frame.rsv3);
        };
        Extensions.prototype.processIncomingMessage = function (message, callback, context) {
            this._pipeline.processIncomingMessage(message, callback, context);
        };
        Extensions.prototype.processOutgoingMessage = function (message, callback, context) {
            this._pipeline.processOutgoingMessage(message, callback, context);
        };
        Extensions.prototype.close = function (callback, context) {
            if (!this._pipeline) {
                return callback.call(context);
            }
            this._pipeline.close(callback, context);
        };
        Extensions.prototype._reserve = function (ext) {
            this._rsv1 = this._rsv1 || (ext.rsv1 && ext.name);
            this._rsv2 = this._rsv2 || (ext.rsv2 && ext.name);
            this._rsv3 = this._rsv3 || (ext.rsv3 && ext.name);
        };
        Extensions.prototype._reserved = function (ext) {
            if (this._rsv1 && ext.rsv1)
                return [1, this._rsv1];
            if (this._rsv2 && ext.rsv2)
                return [2, this._rsv2];
            if (this._rsv3 && ext.rsv3)
                return [3, this._rsv3];
            return false;
        };
        Extensions.__initializer = function(__parent){
            __super=__parent;
            Extensions.MESSAGE_OPCODES = [1, 2];
        };
        return Extensions;
        function Extensions() {
            this._rsv1 = this._rsv2 = this._rsv3 = null;
            this._byName = {};
            this._inOrder = [];
            this._sessions = [];
            this._index = {};
        }
    })();
    module.define('class', Extensions);
    module.export("Extensions", Extensions);
    return {
        setters:[
            function (frame_1_1) {
                frame_1 = frame_1_1;
            },
            function (exts_parser_1_1) {
                exts_parser_1 = exts_parser_1_1;
            },
            function (pipeline_1_1) {
                pipeline_1 = pipeline_1_1;
            }],
        execute: function() {
            Extensions = module.init(Extensions);
        }
    }
});
//# sourceMappingURL=extensions.js.map