// worker.js - processes messages off the queue
// and puts them in the inbox for app servers accordingly

var redis = require('redis').createClient();
var models = require('./models');
var prefix = 'ublog.';

function process() {
  console.log("waiting...");
  redis.brpop(prefix+'messages', 0, function(err, msg) {
    if (!err) {
      try {
        var contents = JSON.parse(msg[1]);
        console.log("Handling message from " + contents.author);
        
        // Before we do anything, save the new message
        var message = new models.Message({
          author: contents.author,
          message: contents.message
        });
        message.save();

        // ... send to inbox queue for application servers
        
      } catch (err) {
        // on error, push the message back on the queue
        // then crash
        console.error(err);
        console.log("Pushing message back: " + msg[1]);
        redis.rpush(prefix+'messages', msg[1]);
        throw(err);
      }
    }

    // when done, wait for more
    process();
  });
}

module.exports.process = process;

if (!module.parent) {
  console.log("ublog worker listening to redis @ %s:%d", redis.host, redis.port);
  process();
};


