var express = require('express');

var app = express();

var mongojs = require('mongojs');

var db = mongojs('54.213.12.222:27017/peeps');

var userCollection = db.collection('users');

//var maps = require('google-maps');

var passport = require('passport');

var bcrypt = require('bcrypt-nodejs');

var hbs= require('express-hbs');

var http = require('http');

var server = http.createServer(app);

var io = require('socket.io').listen(server);

server.listen(3000);

var path = require('path');

//*********************************************************
//************************SETTINGS*************************
//*********************************************************
app.configure( function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hbs');
  app.engine('hbs', hbs.express3({
    partialsDir: __dirname + '/views/partials'
  }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());       // to support JSON-encoded bodies
  app.use(express.urlencoded()); // to support URL-encoded bodies
});

io.configure(function (){
  io.set('authorization', function (handshakeData, callback) {
    callback(null, true); // error first callback style 
  });
});

//*********************************************************
//************************ROUTING**************************
//*********************************************************
app.get('/', function(req,res){
  res.render('index.hbs', {title:'peeps - Let Your Friends Know Where You Wanna Hang'});
});
app.get('/about', function(req,res){
  res.render('about.hbs', {title:'peeps - about'});
});
app.get('/login', function(req,res){
  res.render('login.hbs', {title:'peeps-login'});
});
app.get('/register', function(req,res){
  res.render('register.hbs', {title:'peeps-register'});
});
app.post('/login-submit', passport.authenticate('local', {
  successRedirect:'/main',
  failureRedirect:'/login'
}));
app.post('/register-submit', function(req,res){
  var user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  };
  var acntExists = {}; 
  userCollection.find(user, function(err, docs){
    if(err!==null){
      console.log(err);
    }
    else{
      acntExists=docs;
      return docs;
    }
  });
  if(acntExists === null){
    userCollection.save(user);
    res.send({status:'success', newUser: user});
  }
  else{
    console.log('account already exist');
    res.send({status:'account exists'});
  }
});
app.post('/main', function(req,res){
  var user = userCollection.find(req.body.user);
  res.render('main.hbs', {title: 'peeps - main'});
});