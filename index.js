require('./out/runtime/package');
system.import('http/ejs/test').catch(function(e){
    console.error(e.stack)
});