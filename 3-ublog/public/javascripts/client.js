// ublog Client
// ============

var socket = io.connect();
var pending = [];
var filter = null;

socket.on('message', function(data) {

  // When we connect, the server will send us a buffer full of recent messages.
  // Display these.
  if ('buffer' in data) {
    var messages = document.getElementById('messages');
    messages.innerHTML = '';
    for (var i in data.buffer) {
      show(data.buffer[i]);
    }
  }

  // If a new message arrives, put it the pending queue.  This will create a
  // button that says "New messages".  The user can click this to display the
  // new messages.
  else if ('message' in data) {
    pend(data);
  }
});

// Send a new message.
function send() {
  var input = document.getElementById('input');
  socket.json.send({'message': input.value});
  input.value = '';
}

// Search and filter subsequent messages by the search query.
function search() {
  var input = document.getElementById('query');
  if (input.value) {
    filter = new RegExp(input.value, 'gi');
  } else {
    filter = null;
  }
  socket.json.send({'search': input.value});
}

// Add a message to the list of messages that can be displayed.
function pend(data) {
  if (filter && !data.message.match(filter)) {
    return;
  }

  pending.push(data);
  var el = document.getElementById('pending');
  var info = pending.length + 'new message' + ((pending.length > 1) ? 's' : ''); 
  el.innerHTML = info;
  el.setAttribute('style', 'display: block;');
}

// Show messages that are pending
function showPending() {
  for (var i in pending) {
    show(pending[i]);
  }
  pending = [];

  // Hide the 'N new messages' button
  var el = document.getElementById('pending');
  el.innerHTML = '';
  el.setAttribute('style', 'display: none');
}

// Show a message at the top of the list of messages.
function show(data) {
  // prepend the message to the others
  var messages = document.getElementById('messages');
  var message = document.createElement('div');
  message.setAttribute("class", "message");

  message.innerHTML = '<strong>' + data.author + '</strong><div>' + data.message + '</div><time>' + data.date + '</time>';

  messages.insertBefore(message, messages.firstChild);
}
