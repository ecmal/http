require('./out/runtime/package');
system.import('http/server-test')
    .catch(function(){console.error(e.stack)})
;