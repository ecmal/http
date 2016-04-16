System.register(['./client', './server'], function(exports_1) {
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
            exports_1("HttpServer", server_1.Server);
            exports_1("HttpClient", client_1.Client);
            exports_1("default",{
                version: '0.0.1',
                Client: client_1.Client,
                Server: server_1.Server
            });
        }
    }
});
//# sourceMappingURL=index.js.map