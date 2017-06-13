declare const process;
const Binding = process.binding('http_parser');

export interface HttpParserBinding {
    close()
    execute(data);
    finish()
    reinitialize()
    pause()
    resume()
    consume()
    unconsume()
    getCurrentBuffer()
}
export interface HttpParserBindingConstructor {
    METHODS:string[]
    REQUEST: number;
    RESPONSE: number;
    kOnHeaders: number;
    kOnHeadersComplete: number;
    kOnBody: number;
    kOnMessageComplete: number;
    kOnExecute: number;
    new (type: number): HttpParserBinding;
}
export const HttpParserBinding: HttpParserBindingConstructor = Binding.HTTPParser;
HttpParserBinding.METHODS = Binding.methods;