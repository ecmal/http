import {Server} from '../server';
import {Rest} from '../rest';

import '../handlers/files';
import '../handlers/rest';


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

var server = new Server({
    host : '0.0.0.0',
    port : 3000,
    rest : {
        path : '/api'
    },
    files:{
        path : './web'
    }
}).start();


