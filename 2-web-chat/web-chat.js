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
// [socket.io](http://socket.io) enables real-time communication between clients and server.
// It is the basis of other real-time/rpc libraries (e.g., `now.js`).

var express = require('express');
var io = require('socket.io');

// The `createServer()` method makes a web server.

var app = module.exports = express.createServer();

// We will use these variables to store the names of the people who are
// connected and the chat history.

var people = {};
var buffer = [];

// ### Express Configuration ###

app.configure(function(){
  // Serve views from our `./views` directory
  app.set('views', __dirname + '/views');

  // Use the `jade` templating engine to generate html
  app.set('view engine', 'jade');

  // Use the `express` url routing system
  app.use(app.router);

  // Serve static files from `./public`
  app.use(express.static(__dirname + '/public'));
  
  // Log requests
  app.use(express.logger({format: ':url :method :response-time ms :remote-addr :date'}));
});

// `express` includes these by default, so I'll leave them in.  You can
// configure which is used by setting the `NODE_ENV` environment variables
// `production` or `development`.  I'm going to ignore this for today.

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// ### Routing ###
//
// `express` has an awesome routing system that lets you respond to requests
// first by the http method used (GET, POST, PUT, DELETE), and then by the url.
// For today, we're only using a single url, `/`, to serve our one-page app.
//
// Here, we are saying we want to render the `index.jade` template (that's in
// our `./views` dir), and pass our local `buffer` variable as the value of
// `buffer`.  This lets people catch up on the conversation that's been going
// on.
//
// The `index.jade` template will be loaded after `layout.jade`.  Note that the
// client application is loaded in the browser by these templates.

app.get('/', function(req, res){
  res.render('index', {
    buffer: buffer
  });
});

// ### Running the Server ###
//
// The `listen(<port>)` method binds the server to a port.  It's now running.

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// The Socket.IO Server
// --------------------
//
// Socket.IO keeps a connection open behind the scenes that enables the server
// to push data back up to the client, as well as permitting the client to send
// data down to the server, all without reloading the page.  Even more awesome,
// Socket.IO provides a simple api for whatever mechanism your browser may
// support for doing this (whether it's WebSockets, Comet, long polling,
// carrier pigeon, etc.).
//
// To make the magic happen, we tell the Socket.IO object to `listen()` in on
// our app.

var io = io.listen(app);

// ### Events ###
//
// Like our TCP server, the Socket.IO server responds to certain events. 
// This is really the core of our server application right here.

io.sockets.on('connection', function(socket) {

  // Give people a random name the first time they connect
  people[socket.id] = 'Anonymous' + parseInt(Math.random()*10000);

  // Send the conversation stream thus far up to the new client.
  // The `json` method is necessary if we want to send data like this.  The
  // `send` method sends to the owner of the socket only.
  socket.json.send({buffer: buffer});

  // Tell everyone that we have a new visitor.
  // The `broadcast` method sends a message to every socket *except* the
  // sender.
  socket.broadcast.json.send({announce:people[socket.id] + ' has joined the room'});

  // Be ready to receive messages from this client.
  socket.on('message', function(message) {

    // Set a new nick name?
    if (match = message.match(/\/nick (.*)/)) {
      var formerName = people[socket.id];
      people[socket.id] = match[1];
      socket.broadcast.json.send({announce: formerName + ' is now ' + people[socket.id]});
      socket.json.send({announce: "You are now " + people[socket.id]});
    } 

    // Publish a message as an aside?
    else if (match = message.match(/\/me (.*)/)) {
      socket.broadcast.json.send({announce: people[socket.id] + ' ' + match[1]});
      socket.json.send({announce: people[socket.id] + ' ' + match[1]});
    }

    // Default case: Add the message to the buffer and publish it to all.
    else {
      var msg = {from:people[socket.id], text:message};
      buffer.push(msg);

      // Don't store more than 50 messages.  We're cheap that way.
      if (buffer.length > 50) buffer.shift();

      // This is sort of redundant, but it's the only way I know of to send to
      // every other socket and also the sender's socket.
      socket.broadcast.json.send(msg);
      socket.json.send(msg);
    }
  });

  // If the client disconnects, tell everyone he or she is gone.
  socket.on('disconnect', function() {
    socket.broadcast.send({announce:people[socket.id] + ' has left the room'});
  });
});

