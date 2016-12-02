require('./out/runtime/package');
system.import('http/router-test')
    .catch(function(e){console.error(e.stack)});