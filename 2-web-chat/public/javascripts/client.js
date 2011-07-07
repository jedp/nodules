// Hour of Node 2
// ==============
//
// Real-Time Web Chat Client
// -------------------------
//
// The `io` object is magically available because our app is using Socket.IO
// and we told our html document to load `/socket.io/socket.io.js`.
//
// By calling `connect()`, we set up a connection between the Socket.IO server
// and our client.  This is as close as it gets to having TCP over the web.

var socket = io.connect();

// ### Events ###
//
// If we receive a message from the server, do something with it.

socket.on('message', function(data) {

  // If it is the `buffer` of prior messages, which the server will send us if
  // we have just connected, put each message in our message stream.
  if ('buffer' in data) {
    document.getElementById('chat').innerHTML = '';
    for (var i in data.buffer) {
      message(data.buffer[i]);
    }
  }

  // If it's an announcement.
  else if ('announce' in data) {
    message({from:'', text:'<i>' + data.announce + '</i>'});
  }

  // Default case: It's a chat message from someone.
  else {
    message(data);
  }
});

// ### Sending and Receiving ###
//
// In the following two functions, we respectively show and send messages.  In
// this example, I'm keeping it simple (or at least I think I am) by directly
// using DOM methods to change the contents of the document object in the
// browser.  More typically, people would use some higher-level framework (like
// jQuery) for this.  But that would only complicate things further for today,
// so I'm sticking with the old-fashioned DOM methods.

// Show a message.
function message(data) {
  // Create a paragraph element to put our message in.
  var el = document.createElement('p');

  // Get a handle on the `#chat` element.  By the way, that `#` in the name
  // `#chat` means "`chat` is the ID of the element".
  var chat = document.getElementById('chat');

  // Set the contents of the paragraph.
  el.innerHTML = "<span class='from'>" + data.from + "</span><span> " + data.text + "</span>";

  // Append the paragraph to our `#chat` container, and scroll so everything's
  // still visible in case the page got too long.
  chat.appendChild(el);
  chat.scrollTop = 10000;
}

// Send a message when the user hits enter.
function send() {
  // Get the text value from the `#input` element.
  var input = document.getElementById('input');
  var text = input.value;

  // Send the text over the socket down to the server.  The server's `message`
  // handler will receive this text.
  socket.send(text);

  // Clear out the input field.
  input.value = '';
}
