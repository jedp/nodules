var express = require('express');
var io = require('socket.io');

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
  people[socket.id] = 'anonymous';

  socket.json.send({buffer: buffer});

  socket.broadcast.send({announce:people[socket.id] + ' has joined the room'});

  socket.on('message', function(message) {
    if (match = message.match(/\/nick (.*)/)) {
      var formerName = people[socket.id];
      people[socket.id] = match[1];
      socket.broadcast.send({announce: formerName + ' is now ' + people[socket.id]});
      socket.json.send({announce: "You are now " + people[socket.id]});
    } 

    else if (match = message.match(/\/me (.*)/)) {
      socket.broadcast.send({announce: people[socket.id] + ' ' + match[1]});
      socket.json.send({announce: people[socket.id] + ' ' + match[1]});
    }

    else {
      var msg = {from:people[socket.id], text:message};
      buffer.push(msg);
      if (buffer.length > 50) buffer.shift();
      socket.broadcast.send(msg);
      socket.json.send(msg);
    }
  });

  socket.on('disconnect', function() {
    socket.broadcast.send({announce:people[socket.id] + ' has left the room'});
  });
});

