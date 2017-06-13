require("@ecmal/runtime");
System.load("@test/http/index").then(
    r=>r.server.listen(8080),
    e=>console.error(e)
);