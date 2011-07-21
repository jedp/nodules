// Socket.IO 
// ---------

var socket_io = require('socket.io');
var models = require('./models');

function connect(app) {

  var io = socket_io.listen(app);

  io.sockets.on('connection', function(socket) {
    socket.on('message', function(data) {

      // When someone joins, send the last 50 messages.
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
