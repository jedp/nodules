var socket = io.connect();
socket.on('message', function(data) {
  if ('buffer' in data) {
    document.getElementById('chat').innerHTML = '';
    for (var i in data.buffer) {
      message(data.buffer[i]);
    }
  }
  else if ('announce' in data) {
    message({from:'', text:'<i>' + data.announce + '</i>'});
  }
  else {
    message(data);
  }
});

function message(data) {
  var el = document.createElement('p');
  var chat = document.getElementById('chat');
  el.innerHTML = "<span class='from'>" + data.from + "</span><span> " + data.text + "</span>";
  chat.appendChild(el);
  chat.scrollTop = 10000;
}

function send() {
  var input = document.getElementById('input');
  var text = input.value;
  socket.send(text);
  input.value = '';
}
