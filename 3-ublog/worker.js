// worker.js - processes messages off the queue
// and puts them in the inbox for app servers accordingly

var redis = require('redis').createClient();
var models = require('./models');
var set = require('./utils').Set;
var prefix = 'ublog.';

(function() {


  function process() {
    console.log("waiting...");
    redis.brpop(prefix+'messages', 0, function(err, msg) {
      if (!err) {
        console.log(msg);
        var contents = JSON.parse(msg[1]);
        
        // Before we do anything, save the new message
        var message = new models.Message({
          author: contents.author,
          message: contents.message
        });
        message.save();

        // Get set of followers, including author 
        var following = new Set([contents.author]);

        // ... send to inbox queue for application servers


      }

      // when done, wait for more
      process();
    });
  }

  // start waiting for messages to come in
  process();

})();


