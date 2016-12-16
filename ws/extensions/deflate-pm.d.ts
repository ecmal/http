import { ClientSession } from './deflate-pm/client_session';
import { ServerSession } from './deflate-pm/server_session';
export declare class PerMessageDeflate {
    name: string;
    type: string;
    rsv1: boolean;
    rsv2: boolean;
    rsv3: boolean;
    private _options;
    constructor(options?: any);
    configure(options: any): void;
    createClientSession(): ClientSession;
    createServerSession(offers: any): ServerSession;
}
