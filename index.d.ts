import { Client } from './client';
import { Server } from './server';
export { Server as HttpServer, Client as HttpClient };
declare var _default: {
    version: string;
    Client: typeof Client;
    Server: typeof Server;
};
export default _default;
