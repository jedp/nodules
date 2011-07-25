// Hour of Node 1
// ==============
//
// A TCP Chat Server
// -----------------
//
// Our objectives in this hour were to:
//
// - Make a node "Hello, world"
// - Crash node
// - Make a TCP chat server
//
// ### Includes ###
//
// The node `require` function is like `include` or `import`. It looks in the
// system's standard paths for modules you specify. You can also use relative
// paths, as in `require("./foo/bar")`.

var net = require('net');

// ### Variables ###
//
// So as not to stomp on the global namespace, always use `var` when declaring
// variables, even at the top level of a module, in case someone wants to
// include that module in another application.
//
// JavaScript variables have *function* scope.  Not block scope.  Don't forget
// that.

var clients = [];
var names = {};
var i;

// ### Functions ###
//
// Functions can be declared anywhere in your program, and used before they are
// declared.  Variables on the other hand can only be used after they have been
// declared.

function tellAll(message) {
  for (i=0; i<clients.length; i++) {
    clients[i].write(message);
  }
}

// ### A TCP Server ###
//
// See the [node.js documentation](http://nodejs.org) for any questions.
//
// Here, we create a socket server, which uses TCP4 by default.  We provide a
// function as an argument to the `createServer()` method.  This is a vary
// common pattern in node.  The function is a callback that will be invoked
// when `createServer` has done its work.  In this case, `createServer` passes
// the new `socket` object as an argument to our callback. 
//
// Two things to note:
// 
// 1. This is asynchronous.  We don't know when our callback will be invoked.
// 2. Our logic is broken up across callbacks.
//
// This is the main thing you have to get used to when programming node.  In an
// imperative language (e.g., Python), you would say something like this:
//
//     server = createServer()
//     # now do something with server.socket ...
//
// Not so in node.

var server = net.createServer(function(socket) {

  // The function we are in now is a closure.  The following `socket_id`
  // variable will be uniquely defined for each invocation of this function.

  var socket_id = socket.remoteAddress + '/' + socket.remotePort;

// #### Handlers ####
//
// The `socket` object responds to events.  You can register callbacks that
// will be invoked for events like "connect", "data", "end", etc.  Use the
// `socket.on` method to do this.
//
// The connect handler will be triggered when someone conects to our server.
// Here we tell everyone in our room that someone has joined, and then adds the
// connected `socket` to the list of people in our room.

  socket.on('connect', function() {
    if (typeof names[socket_id] === 'undefined') {
      names[socket_id] = socket_id;
    }
    tellAll(names[socket_id] + ' has joined the party\n');
    clients.push(socket);
  });

// Our data handler will be called when we receive data from a socket.  By
// default, we just broadcast the data to everyone.  But if the data begins
// with a '/', we interpret it as a special command. 

  socket.on('data', function(data) {

// `data` contains a `buffer` object.  If you `console.log()` it, you'll see a
// representation of a binary string.  So we use its `toString()` method to
// convert it to text.  

    if (data.toString().match(/^\//)) {

// You might expect the first match of a regex to be indexed as item `[0]`, but
// no.  Play with regexes in the `node` shell and see how they work.  I've
// shown two ways to work with regexes here: `exec`ing a regex, and `match`ing
// a string.

      var match = /\/(\w+)\s+(.*)/.exec(data.toString());
      var cmd = match[1];
      var arg = match[2];

      switch (cmd) {

// You can change your nick by typing `/nick newname`.  When you do this, the
// server will record the new name associated with your address.  We tell the
// room when someone changes their name.

        case "nick":
          var oldName = names[socket_id];
          names[socket_id] = arg;
          tellAll(oldName + ' is now ' + arg + '\n');
          break;

// If you type `/quit`, we'll close the connection.  Note that we don't tell
// everyone you've left here, because we have an "end" handler below that will
// do this for us when the connection ends for any reason.  For instance, the
// client might just disconnect without using the `/quit` command.

        case "quit":
          socket.end();
          break;

// If we didn't understand the command, we send a helpful private message to
// the sender.

        default:
          socket.write("wtf?");
      }

// Our default action for messages is to broadcast them to the whole channel.

    } else {
      tellAll(names[socket_id] + ': ' + data);
    }
  });

// Our end handler removes the socket from the list of connected clients and
// tells everyone the person has left.

  socket.on('end', function() {
    var addr = socket_id;
    var i = clients.indexOf(socket);
    clients.splice(i, 1);
    tellAll(names[addr] + '(' + addr + ') has left the building\n');
  });
});

// ### Exposing as a Module ###
//
//
// When running in `node`, your script has access to the special global
// variable `exports`.  `exports` is the objects that is returned when someone
// `require()`s your module.
//
// Just to be safe, we check whether `exports` exists.  Undefined things always
// return a type of `undefined`.  Be aware that this is different from the
// (defined) value of `null`.
//
// Now someone can put your chat server in their program like so:
// 
//      var server = require("path/to/yourchat").server;
//      server.listen(8000);

if (typeof exports !== 'undefined') {
  exports.server = server;
}

// ### Running A Script ###
//
// Testing for `! module.parent` is like testing for `__name__ == '__main__'`
// in Python.

if (!module.parent) {

// If invoked as a shell script, listen on localhost on port 8000.
// This will run until you interrupt it.
//
// If you don't like how the port and address are hard-wired here, your
// homework is to use a node command-line option parser or a config file to set
// these values.

  server.listen(8000, "127.0.0.1", function() {
    console.log("listening on " 
                + server.address().address + ' ' 
                + server.address().port);
  });
}


