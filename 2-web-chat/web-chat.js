// Hour of Node 2
// ==============
//
// A Real-Time Web Chat Server
// ---------------------------
//
// To set up for this application, do the following:
//
// - Create a new directory for your app and cd into it
// 
// Now run these commands:
// 
// - `npm install express`
// - `npm install jade`
// - `npm install socket.io`
// - `express` 
//
// The last command will set up your web application's files and directories.
//
// ### Includes ###
//
// In our TCP chat server, we used the `net` module to build our servers.
// In this example, we are going to use two commonly-used modules.
//
// `express` is the most widely-used web application framework for Node.JS.
// `socket.io` enables real-time communication between clients and server.
// It is the basis of other real-time/rpc libraries (e.g., `now.js`).

var express = require('express');
var io = require('socket.io');

// 

var app = module.exports = express.createServer();

var people = {};
var buffer = [];

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  
  app.use(express.logger({format: ':url :method :response-time ms :remote-addr :date'}));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    buffer: buffer
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// socket.io

var io = io.listen(app);

io.sockets.on('connection', function(socket) {
  console.log("connected: " + socket.id);
  people[socket.id] = 'anonymous';

  socket.json.send({buffer: buffer});

  socket.broadcast.json.send({announce:people[socket.id] + ' has joined the room'});

  socket.on('message', function(message) {
    if (match = message.match(/\/nick (.*)/)) {
      var formerName = people[socket.id];
      people[socket.id] = match[1];
      socket.broadcast.json.send({announce: formerName + ' is now ' + people[socket.id]});
      socket.json.send({announce: "You are now " + people[socket.id]});
    } 

    else if (match = message.match(/\/me (.*)/)) {
      socket.broadcast.json.send({announce: people[socket.id] + ' ' + match[1]});
      socket.json.send({announce: people[socket.id] + ' ' + match[1]});
    }

    else {
      var msg = {from:people[socket.id], text:message};
      buffer.push(msg);
      if (buffer.length > 50) buffer.shift();
      socket.broadcast.json.send(msg);
      socket.json.send(msg);
    }
  });

  socket.on('disconnect', function() {
    socket.broadcast.send({announce:people[socket.id] + ' has left the room'});
  });
});

