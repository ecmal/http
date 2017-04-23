import {expect} from "@ecmal/chai/index";
import {server} from "../index";
import {client} from "../client";

async function test(param){
    return new Promise((accept,reject)=>{
        setTimeout(()=>accept({hello:param}),1000);
    })
}

export default 
describe("Server Test",()=>{
    it("Run Server",async ()=>{
        server.listen(8000);
        let value = await client.test({
            host:"localhost",
            port:8000
        });
        expect(value).to.haveOwnProperty('barev');
        expect(value).property('barev','Katyush');
    });
});

