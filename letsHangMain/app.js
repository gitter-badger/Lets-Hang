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

var hbs = require('express-hbs');

var http = require('http');

var server = http.createServer(app);

var io = require('socket.io')(server);

var pub = require('redis').createClient(6379, '127.0.0.1', {return_buffers:true});

var sub = require('redis').createClient(6379, '127.0.0.1', {return_buffers:true});

var redis = require('socket.io-redis');

io.adapter(redis({pubClient: pub, subClient: sub}));

server.listen(8080);

//server.listen(80);

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
  app.use(passport.session());
});
io.set('authorization', function (handshakeData, callback) {
  callback(null, true); // error first callback style 
});
io.set('transports', ['websocket']);
console.log('server started');

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
app.post('/login-submit', passport.authenticate('local-login',{
  successRedirect: '/main',
  failureRedirect: '/login'
}));
app.post('/register-submit', passport.authenticate('local-signup',{
  successRedirect: '/main',
  failureRedirect: '/register'
}));
app.get('/main', isLoggedIn, function(req,res){
  var user = req.user;
  console.log(user);
  var activities = require('./models/activitiesModel');
  if(user){ 
    activities.find({creator:user.id}, function(err, acts){
      if(err){
        console.log(err);
      }
      else{
        var messages = require('./models/messageModel');
        messages.find({sender:user.id}, function(err,mess){
          if(err){
            console.log(err);
          }
          else{
            var locations = require('./models/locationModel');
            locations.find({user: user.id}, function(err,locs){
              if(err){
                console.log(err);
              }
              else{
                var dataToSend = {
                  title: 'peeps - main', 
                  activity: acts, 
                  messages: mess, 
                  location: locs,
                  user: user
                };
                res.render('main.hbs', dataToSend);
                return locs;
              }
            });
            return mess;
          }
        });
        return acts;
      }
    });
  }
  else{
   res.redirect('/login');
  }
});
app.post('/main/locations', function(req, res){
  var User = require('./models/user');
  var activities = require('./models/activitiesModel');
  User.findOne({'local.email': req.body.email}, function(err, user){
    if(err){
      console.log(err);
    }
    if(user){
      activities.findOne({creator: user.id}, function(err, acts){
        if(err){
          console.log(err);
        }
        if(acts){
          res.send(acts);
          return acts;
        }
        else{
          res.send({});
          return;
        }
      });
    }
    return user;
  });
});
app.post('/main/invite', function(req,res){
  var User = require('./models/user');
  var activities = require('./models/activitiesModel');
  var data = {list: new Array()};
  User.findOne({'local.email':req.body.email}, function(err, user){
    activities.find({creator:user.id}, function(err, acts){
      if(err){
        console.log(err);
      }
      if(acts){
        for(var i = 0; i<acts.length; i++){
          data.list.push(acts[i].invited);
        }
        res.send(data.list);
      }
      else{
        res.send({});
      }
    });
  });
});
app.post('/main/create-activity', function(req, res){
  var User = require('./models/user');
  var activity = require('./models/activitiesModel');
  var recData = req.body;
  var result = new activity();
  User.findOne({'local.email':recData.email}, function(err, user){
    result.name = recData.name;
    result.creator = user.id;
    result.startDate = recData.startDate;
    result.endDate = recData.endDate;
    result.startTime = recData.startTime;
    result.endTime = recData.endTime;
    result.invited = recData.invited;
    var mapsURL = 'https://maps.googleapis.com/maps/api/geocode/json?address='+recData.location+'&key='+googleKey;
    rClient.get(mapsURL, function(data, response){
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
});
var inviteUser;
var actInv;
app.post('/main/invite-out', function(req, res){
  var User = require('./models/user');
  User.findOne({_id: req.body.user}, function(err, doc){
    if(err){
      console.log(err);
    }
    else{
      actInv = {invited: new Array(doc)};
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
  var User = require('./models/user');
  var messages = require('./models/messageModel');
  var activities = require('./models/activitiesModel');
  var sender = messUser;
  User.findOne({'local.email':sender}, function(err, user){
    activities.findOne({name:messAct, creator: user.id}, function(err, cAct){
      messages.find({activity: cAct.id}, function(err, docs){
        if(err){
          console.log(err);
          return;
        }
        sub.subscribe(cAct.id);
        var message = new Array();
        for(var i = 0; i<docs.length; i++){
          if(docs[i].sender==user.id){
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
  });
});
app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/google', passport.authenticate('google', {scope:['profile', 'email']}));
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
app.put('/change-password', function(req, res){
  var User = require('./models/user');
  User.find({'local.email': req.body.email}, function(err, user){
    if(err){
      console.log(err);
    }
    if(user.validPassword(req.body.oldPassword)){
      user.password = user.generateHash(req.body.newPassword);
      user.save(function(err){
        if(err){
          console.log(err);
        }
        res.send({message:'success'});
      });
    }
    else{
      res.send({message:'Invalid Old Password'});
    }
  });
});
app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/');
});

//*********************************************************
//*************************SOCKETS*************************
//*********************************************************

io.sockets.on('connection', function(socket){
  var User = require('./models/user');
  var activities = require('./models/activitiesModel');
  var messages = require('./models/messageModel');
  console.log('socket.io started');
  if(inviteUser){
    activities.find(actInv, function(err, docs){
      if(err){
        console.log(err);
      }
      else{
        socket.emit('findUser');
        socket.on('foundUser', function(userData){
          if(userData == actInv.invited.pop()){
            socket.emit('inviteIn', docs);
          }
        });
      }
    });
  }
  socket.on('textChange', function(data){
    var first = data.substring(0, data.indexOf(' '));
    var last = data.substring(data.indexOf(' ')+1);
    User.find({'local.name':first, 'local.lastName':last}, function(err, users){
      if(err){
        console.log(err);
      }
      if(users){
        socket.emit('users-found', {Users: users});
      }
    });
  });
  socket.on('send', function(msg){
    User.find({'local.email': msg.sender}, function(err, user){
      activities.findOne({name: msg.name, creator:user.id}, function(err, act){
        if(err){
          console.log(err);
        }
        if(act){
          var mess = new messages();
          mess.sender = user.id;
          mess.content = msg.content;
          mess.activity = act.id;
          mess.receiver = act.invited;
          mess.sendDate = new Date();
          mess.save(function(err){
            if(err){
              console.log(err);
            }
          });
          pub.publish(act.id, user.name+'is chatting, '+msg.content+', on'+msg.date);
          socket.broadcast.emit('recieve',msg);
        }
        else{
          activities.findOne({name: msg.name, invited: new Array(user.id)}, function(err, act){
            if(err){
              console.log(err);
            }
            var mess = new messages();
            mess.sender = user.id;
            mess.content = msg.content;
            mess.activity = act.id;
            mess.receiver = act.invited.push(act.creator);
            mess.sendDate = new Date();
            mess.save(function(err){
              if(err){
                console.log(err);
              }
            });
          });
          socket.broadcast.emit('recieve',msg);
        }
      });
    });
  });
});

//*********************************************************
//*********************AUTHENTICATION**********************
//*********************************************************
function isLoggedIn(req, res, next){
  console.log(req.user);
  if(req.isAuthenticated()){
    return next();
  }
  else{
    console.log('redirect');
    res.redirect('/');
  }
}
