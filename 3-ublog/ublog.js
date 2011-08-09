// Socket.IO 
// ---------

var socket_io = require('socket.io');
var models = require('./models');
var redis = require('redis').createClient();
var parseCookie = require('connect').utils.parseCookie;

function connect(app, sessionStore, sessionKey) {
  var io = socket_io.listen(app);

  io.set('authorization', function(data, accept) {
    if (data.headers.cookie) {
      console.log(data.headers.cookie);
      console.log(typeof parseCookie);
      data.cookie = parseCookie(data.headers.cookie);
      data.sessionID = data.cookie[sessionKey];
      sessionStore.get(data.sessionID, function(err, session) {
        if (err) {
          accept(err.message, false);
        } else {
          data.session = session;
          accept(null, true);
        }
      }); 
    } else {
      return accept('No session cookie', false);
    }
  });

  io.sockets.on('connection', function(socket) {

    var username = socket.handshake.session.username

    socket.on('message', function(data) {

      // When someone joins, send the last 50 messages.
      if ('join' in data) {
        console.log("join");
        console.log(data);
        username = data.join;
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

      // When somebody sends a message, stick it on the queue
      // for processing
      else if ('message' in data) {
        var message = {'author': username, 
                       'message': data.message};
        console.log(message);
      }

      // Search for the 50 most recent messages matching the query.
      else if ('search' in data) {
        var query = new RegExp(data.search, 'gi');
        models.Message
          .find({'message': query})
          .sort('$natural', 'ascending')
          .limit(50)
          .execFind(function(err, messages) {
            socket.json.send({buffer: messages});
        });
      }
    });

    socket.on('disconnect', function() {
    });
  });

  return this;
}

exports.connect = connect;
