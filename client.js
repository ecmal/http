require('@ecmal/runtime');
System.load('@ecmal/http/test/client').then(
    m => m.main(),
    e => console.error(e)
)