system.register("http/index", ['./client', './server'], function(system,module,jsx) {
    var client_1, server_1;
    return {
        setters:[
            function (client_1_1) {
                client_1 = client_1_1;
            },
            function (server_1_1) {
                server_1 = server_1_1;
            }],
        execute: function() {
            module.export("HttpServer", server_1.Server);
            module.export("HttpClient", client_1.Client);
            module.export("default",{
                version: '0.0.1',
                Client: client_1.Client,
                Server: server_1.Server
            });
        }
    }
});
//# sourceMappingURL=index.js.map