// ublog
// =====
//
// A simple microblogging application and service in Node.JS.
//
// Imports
// -------

var express = require('express');
var ublog = require('./ublog');

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

ublog.connect(app);

app.get('/', function(req, res){
  res.render('feed');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  console.dir(req);
  res.send(200);
});

app.get('/logout', function(req, res) {
  res.render('logout');
});


if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}

