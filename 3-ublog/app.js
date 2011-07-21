// ublog
// =====
//
// A simple microblogging application and service in Node.JS.
//
// Imports
// -------

var express = require('express');
var auth = require('./auth');
var ublog = require('./ublog');

var app = module.exports = express.createServer();

// Configuration
// -------------

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  // bodyParser enables us to retrieve POST data, which
  // we will need for our login form
  app.use(express.bodyParser());

  // User session management to keep track of whether a 
  // client is logged in or not.
  app.use(express.cookieParser());
  app.use(express.session({'secret': "Attack at dawn!"}));

  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
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
  if (req.session.auth) {
    res.render('feed', {
      username: req.session.username
    });
  } else {
    res.render('login');
  }
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  req.session.auth = true;
  req.session.username = req.body.username;
  res.redirect('/');
});

app.get('/logout', function(req, res) {
  req.session.destroy();
  res.render('logout');
});

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}

