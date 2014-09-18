//*********************************************************
//************************GLOBALS*************************
//*********************************************************

var express = require('express');

var app = express();

var mongoose = require('mongoose');

var dbConfig = require('./models/config');

mongoose.connect(dbConfig.url);

var passport = require('passport');

var morgan = require('morgan');

var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');

var session = require('express-session');

var restClient = require('node-rest-client').Client;

var rClient = new restClient();

var hbs= require('express-hbs');

var http = require('http');

var server = http.createServer(app);

var io = require('socket.io').listen(server);

//server.listen(3000);

server.listen(80);

var path = require('path');

require('./auth/auth')(passport);

var googleKey = 'AIzaSyBfIApUobHr1J1OYNpBIy9D1AL5cfZadgs';

//*********************************************************
//************************SETTINGS*************************
//*********************************************************

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hbs');
  app.engine('hbs', hbs.express3({
    partialsDir: __dirname + '/views/partials'
  }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());       // to support JSON-encoded bodies
  app.use(express.urlencoded()); // to support URL-encoded bodies
  app.use(morgan('dev'));
  app.use(cookieParser());
  app.use(bodyParser());
  app.use(session({secret:'B1_1ubbadoo!?'}));
  app.use(passport.initialize());
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
app.post('/login-submit', passport.authenticate({
  successRedirect: '/main',
  failureRedirect: 'login'
}));
app.post('/register-submit', passport.authenticate({
  successRedirect: '/main',
  failureRedirect: '/register'
}));
app.get('/main', function(req,res){
  var uData = null;
  userCollection.findOne({email: req.body.email}, function(err,uDoc){
    if(err){
      console.log(err);
    }
    else{
      uData = uDoc;
      var aData = null;
      if(uDoc !== null){ 
        activitiesCollection.find(uDoc.name, function(err, aDocs){
          if(err){
            console.log(err);
          }
          else{
            aData = aDocs;
            var mData = null;
            messageCollection.find(uDoc.name, function(err,mDocs){
              if(err){
                console.log(err);
              }
              else{
                mData = mDocs;
                var lData = null;
                locationCollection.find(uDoc.name, function(err,lDocs){
                  if(err){
                    console.log(err);
                  }
                  else{
                    lData = lDocs;
                    var dataToSend = {
                      title: 'peeps - main', 
                      activity: aData, 
                      messages: mData, 
                      location: lData,
                      user: uData
                    }
                    res.render('main.hbs', dataToSend);
                    return lDocs;
                  }
                });
                return mDocs;
              }
            });
            return aDocs;
          }
        });
      }
      else{
        res.render('main.hbs');
      }
      return uDoc;
    }
  });
});
app.post('/main/locations', function(req, res){
  var lData = null;
  activitiesCollection.findOne({creator:req.body.user}, function(err, docs){
    if(err){
      console.log(err);
    }
    else{
      lData = docs;
      res.send(lData);
      return docs;
    }
  });
});
app.post('/main/invite', function(req,res){
  var data = {list: new Array()};
  activitiesCollection.find({creator:req.body.name}, function(err, docs){
    if(err){
      console.log(err);
    }
    if(docs !== null){
      for(var i = 0; i<docs.length; i++){
        data.list.push(docs[i].invited);
      }
      res.send(data.list);
    }
    else{
      res.send({});
    }
  });
});
app.post('/main/create-activity', function(req, res){
  var recData = req.body;
  var result = null;
  if(req.body.endDate!==null){
    if(req.body.endTime!==null){
      result = {
        lat: null,
        lng: null,
        name: recData.name,
        creator: recData.user,
        startDate: recData.startDate,
        endDate: recData.endDate,
        startTime: recData.startTime,
        endTime: recData.endTime,
        invited: recData.invited
      };
    }
    else{
      result = {
        lat: null,
        lng: null,
        name: recData.name,
        creator: recData.user,
        startDate: recData.startDate,
        endDate: recData.endDate,
        startTime: recData.startTime,
        invited: recData.invited
      };
    }
  }
  else{
    if(req.body.endTime!==null){
      result = {
        lat: null,
        lng: null,
        name: recData.name,
        creator: recData.user,
        startDate: recData.startDate,
        startTime: recData.startTime,
        endTime: recData.endTime,
        invited: recData.invited
      };
    }
    else{
      result = {
        lat: null,
        lng: null,
        name: recData.name,
        creator: recData.user,
        startDate: recData.startDate,
        startTime: recData.startTime,
        invited: recData.invited
      };
    }
  }
  rClient.get('https://maps.googleapis.com/maps/api/geocode/json?address='+recData.location+'&key='+googleKey, function(data, response){
    if(JSON.parse(data).status!='OK'){
      console.log(JSON.parse(data).status);
      return;
    }
    result.lat = JSON.parse(data).results[0].geometry.location.lat;
    result.lng = JSON.parse(data).results[0].geometry.location.lng;
    activitiesCollection.save(result);
    locationCollection.save({_id: 1, name: recData.location, Lat: result.lat, Long: result.lng, user:result.user, })
    res.send(result);
  }); 
});
var inviteUser;
var actInv;
app.post('/main/invite-out', function(req, res){
  userCollection.findOne({name: req.body.user}, function(err, doc){
    if(err){
      console.log(err);
    }
    else{
      inviteUser = doc;
      actInv = {
        invited: new Array(inviteUser)
      };
    }
  });
});
var messUser;
var messAct;
app.post('/main/create-message', function(req,res){
  messUser = req.body.user;
  messAct = req.body.name;
  res.send({name:messAct});
});
app.get('/message', function(req, res){
  var sender = messUser;
  var mActivity = messAct;
  messageCollection.find({activity: mActivity}, function(err, docs){
    if(err){
      console.log(err);
      return;
    }
    var message = new Array();
    for(var i = 0; i<docs.length; i++){
      if(docs[i].sender==sender){
        message[i]={
          sender: true,
          content: docs[i].content,
          activity: docs[i].activity,
          date: docs[i].date
        };
      }
      else{
        message[i]={
          sender: false,
          content: docs[i].content,
          activity: docs[i].activity,
          date: docs[i].date
        };
      }
      if(i==docs.length-1){
        res.render('messenger.hbs', {messages:message});
        return;
      }
    }
    res.render('messenger.hbs', {messages:message});
  });
});
app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/google', passport.authenticate('google', {scope:['profile', 'email']}));
//app.get('/add/:service', authom.app);
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/main',
    failureRedirect: '/'
  }));
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: '/main',
    failureRedirect: '/'
  }));
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/main',
    failureRedirect: '/'
  }));

//*********************************************************
//*************************SOCKETS*************************
//*********************************************************

io.sockets.on('connection', function(socket){
  console.log('socket.io started');
  if(inviteUser!==null){
    activitiesCollection.find(actInv, function(err, docs){
      if(err){
        console.log(err);
      }
      else{
        socket.emit('findUser');
        socket.on('foundUser', function(userData){
          if(userData==actInv[0]){
            socket.emit('inviteIn', docs);
          }
        });
      }
    });
  }
  socket.on('send', function(msg){
    messageCollection.save(msg);
    socket.broadcast.emit('recieve',msg);
  });
});

//*********************************************************
//*********************AUTHENTICATION**********************
//*********************************************************
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}
