import {expect,assert} from "@ecmal/chai/index";
import {server} from "./server";
import {client} from "./client";
class RestTest{
    static methods = ['GET',"POST","PUT","DELETE"];
    static testForRoute(method){
        it(`Simple route test: method - ${method}`,async ()=>{
            let value = await client.request({
                host:"localhost",
                port:8787,
                path:'/resource',
                method:method,
            });

            expect(value.statusCode).to.be.equal(200);
            let jsonData =  await value.json();
            expect(jsonData.param).to.not.be.ok;
            expect(jsonData.query).to.not.be.ok;
            expect(jsonData.param1).to.not.be.ok;
            expect(jsonData.query1).to.not.be.ok;
        });

        it(`Simple route test with query param : method - ${method}`, async ()=>{
            let value = await client.request({
                host:"localhost",
                port:8787,
                path:'/resource?q=query_param',
                method:method,

            });
            expect(value.statusCode).to.be.equal(200);
            let jsonData =  await value.json();
            expect(jsonData.query).to.be.equal('query_param');
            expect(jsonData.query1).to.be.equal('query_param');
            expect(jsonData.param1).to.not.be.ok;
            expect(jsonData.param).to.not.be.ok;

        });

        it(`Simple route test with path param : method - ${method}`, async ()=>{
            let value = await client.request({
                host:"localhost",
                port:8787,
                path:'/resource_with_param/path_param',
                method:method,

            });
            expect(value.statusCode).to.be.equal(200);
            let jsonData =  await value.json();
            expect(jsonData.param1).to.be.equal('path_param');
            expect(jsonData.param1).to.be.equal('path_param');
            expect(jsonData.query1).to.not.be.ok;
            expect(jsonData.query).to.not.be.ok;
        });

        it(`Simple route test with query and path param : method - ${method}`, async ()=>{
            let value = await client.request({
                host:"localhost",
                port:8787,
                path:'/resource_with_param/path_param?q=query_param',
                method:method,

            });
            expect(value.statusCode).to.be.equal(200);
            let jsonData =  await value.json();
            expect(jsonData.param1).to.be.equal('path_param');
            expect(jsonData.query).to.be.equal('query_param');
            expect(jsonData.param1).to.be.equal('path_param');
            expect(jsonData.query1).to.be.equal('query_param');
        });

        it(`Nested route test with query and path params: method - ${method}`, async ()=>{
            let value = await client.request({
                host:"localhost",
                port:8787,
                path:'/resource_with_param/48/nested?q=query_param',
                method:method,

            });
            expect(value.statusCode).to.be.equal(200);
            let jsonData =  await value.json();
            expect(jsonData.param1).to.be.equal('48');
            expect(jsonData.query).to.be.equal('query_param');
            expect(jsonData.param1).to.be.equal('48');
            expect(jsonData.query1).to.be.equal('query_param');

            value = await client.request({
                host:"localhost",
                port:8787,
                path:'/resource/nested?q=query_param',
                method:method,

            });
            expect(value.statusCode).to.be.equal(200);
            jsonData =  await value.json();
            expect(jsonData.param1).to.not.be.ok;
            expect(jsonData.param).to.not.be.ok;
            expect(jsonData.query).to.be.equal('query_param');
            expect(jsonData.query1).to.be.equal('query_param');
        });
    }
    static test(){
        this.methods.forEach((method)=>{
            this.testForRoute(method);
        })
    }
}
class StaticResourceTest{
    static test(){
        it(`JSON Resource test`,async ()=>{
            let result = await client.request({
                host:"localhost",
                port:8787,
                path:'/json/test.json',
                method:'GET',
            });
            expect(result.statusCode).to.be.equal(200);
            expect(result.headers['content-type']).to.contain('application/json');
            let jsonData =  await result.json();
            expect(jsonData.key).to.be.equal('value')
        });
        it(`Html Resource test`,async ()=>{
            let result = await client.request({
                host:"localhost",
                port:8787,
                path:'/html/one.html',
                method:'GET',
            });
            expect(result.statusCode).to.be.equal(200);
            let text = await result.text();
            expect(text).to.be.equal('one');
            result = await client.request({
                host:"localhost",
                port:8787,
                path:'/html/two.html',
                method:'GET',
            });
            expect(result.statusCode).to.be.equal(200);
            expect(result.headers['content-type']).to.contain('text/html');
            text = await result.text();
            expect(text).to.be.equal('two')
        });
        it(`HTML default Resource test`,async ()=>{
            let result = await client.request({
                host:"localhost",
                port:8787,
                path:'/html/',
                method:'GET',
            });
            expect(result.statusCode).to.be.equal(200);
            let text = await result.text();
            expect(text).to.be.equal('index')
        });

    }
}
class EjsResourceTest{
    static test(){
        it(`Ejs Resource test`,async ()=>{
            let result = await client.request({
                host:"localhost",
                port:8787,
                path:'/view/ejs',
                method:'GET',
            });
            expect(result.statusCode).to.be.equal(200);
            expect(result.headers['content-type']).to.contain('text/html');
            let text =  await result.text();
            expect(text).to.contain('INCLUDED');
            expect(text).to.contain('EJS');
        });

    }
}

server.listen(8787);
it("Run Server",async ()=>{
    let value = await client.request({
        host:"localhost",
        port:8787,
        path:'/'
    });
    expect(value).to.be.ok;
});
describe("Rest Resource Test",()=>{
    RestTest.test();
});
describe("Static Resource Test",()=>{
    StaticResourceTest.test();
});

describe("Ejs Resource Test ",()=>{
    EjsResourceTest.test()
});


