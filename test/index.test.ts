//mocha --delay node_modules/@test/http/index.test.js
require("@ecmal/runtime");
System.load("@test/http/tests/simple.test").then(
    r=>run(),
    e=>console.error(e)
);