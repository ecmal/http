import {Server} from 'http/server';

import {Rest} from 'http/rest';

@Rest('/hello')
class HelloResource {
    private query:any;
    private headers:any;
    get(){
        return {
            resource : 'Hello',
            query    : this.query,
            headers  : this.headers
        }
    }
}

new Server({
    host : '0.0.0.0',
    port : 3000,
    rest : {
        path : '/api'
    }
}).start();