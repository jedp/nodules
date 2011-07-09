// ublog
// =====
//
// A simple microblogging application and service in Node.JS.
//
// Imports
// -------

var express = require('express');
var socket_io = require('socket.io');
var models = require('./models');

var app = module.exports = express.createServer();

// Configuration
// -------------

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
// ------
//
// Right now we have only one route, the feed.  This makes me think we don't
// really want to use express for this after all.

app.get('/', function(req, res){
  res.render('feed', {
    title: 'feed'
  });
});

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}

// Socket.IO 
// ---------

var io = socket_io.listen(app);
io.sockets.on('connection', function(socket) {

  socket.on('message', function(data) {

    // when someone joins, send the last 50 messages.
    if ('join' in data) {
      models.Message
        .find()
        .sort('$natural', 'ascending')
        .limit(50)
        .execFind(function(err, messages) {
          if (!err) {
            socket.json.send({buffer: messages});
          }
      });
    }

    // When somebody sends a message, save it and broadcast it.
    else if ('message' in data) {
      var message = new models.Message({
        username: 'foo',
        message: data.message,
        date: new Date()
      });
      message.save();
      socket.broadcast.json.send(message);
      socket.json.send(message);
    }
  });

  socket.on('disconnect', function() {
  });
});
