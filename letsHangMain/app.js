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

var helmet = require('helmet');

var http = require('http');

var server = http.createServer(app);

var io = require('socket.io')(server);

var pub = require('redis').createClient(6379, '127.0.0.1', {return_buffers:true});

var sub = require('redis').createClient(6379, '127.0.0.1', {return_buffers:true});

var rStore = require('redis').createClient(6379, '127.0.0.1', {return_buffers:false});

var redis = require('socket.io-redis');

io.adapter(redis({pubClient: pub, subClient: sub}));

server.listen(8080);

//server.listen(80);

var path = require('path');

require('./auth/auth')(passport);

var googleKey = 'AIzaSyBfIApUobHr1J1OYNpBIy9D1AL5cfZadgs';

var router = express.Router();

var authRouter = express.Router();

//*********************************************************
//************************SETTINGS*************************
//*********************************************************

app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.engine('hbs', hbs.express3({
  partialsDir: __dirname + '/views/partials'
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.use(helmet({xframe: false, hsts: false}));
app.use(helmet.xframe('sameorigin'));
app.use(helmet.csp({
  defaultSrc: ["'self'", 'http://localhost:8080','http://localhost:8080/socketio/*', 'ws://localhost:8080','https://*.googleapis.com', 'https://*.gstatic.com', 'http://maxcdn.bootstrapcdn.com', "'unsafe-inline'", "'unsafe-eval'"],
  reportUri: '/report-violation',
  reportOnly: false,
  setAllHeaders: false,
  safari5: false
}));
app.use(session({secret:'B1_1ubbadoo!?'}));
app.use(passport.initialize());
app.use(passport.session());
io.set('authorization', function (handshakeData, callback) {
  callback(null, true);
});
io.set('transports', ['websocket']);
require('./sockets/sockets.js')(io, pub, sub, rStore);
console.log('server started port: 8080');

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
router.get('/', isLoggedIn, function(req,res){
  var user = req.user;
  var activities = require('./models/activitiesModel');
  if(user){
    sub.subscribe(req.user.id);
    rStore.set('sUserID', req.user.id);
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
                locs.map(function(loc){
                  if(loc.name.indexOf('+')<0){
                    return;
                  }
                  for(var i = 0; i<loc.name.length; i++){
                    if(loc.name.charAt(i)=='+'){
                      loc.name = loc.name.substring(0, i)+' '+loc.name.substring(i+1);
                    }
                  }
                });
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
router.post('/locations', function(req, res){
  var user = req.user;
  var activities = require('./models/activitiesModel');
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
        res.send();
        return;
      }
    });
  }
});
router.post('/invite', function(req,res){
  var User = require('./models/user');
  var activities = require('./models/activitiesModel');
  var data = {list: []};
  User.findOne({'local.email':req.body.email}, function(err, user){
    activities.find({creator:user.id}, function(err, acts){
      if(err){
        console.log(err);
      }
      if(acts){
        for(var i = 0; i<acts.length; i++){
          console.log(acts[i]);
          data.list.push(acts[i].invited);
        }
        res.send(data);
        console.log('data: '+data.list);
      }
      else{
        res.send({});
      }
    });
  });
});
router.post('/create-activity', function(req, res){
  var User = require('./models/user');
  var activity = require('./models/activitiesModel');
  var location = require('./models/locationModel');
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
      result.save(function(err){
        if(err){
          console.log(err);
        }
      });
      var loctRes = new location();
      loctRes.name = recData.location;
      loctRes.Lat = result.lat;
      loctRes.Long = result.lng;
      loctRes.user = result.creator;
      location.find({name: loctRes.name}, function(err, docs){
        if(err){
          console.log(err);
        }
        if(docs.length>0){
          console.log('location exists');
          return;
        }
        else{
          loctRes.save(function(err){
            if(err){
              console.log(err);
            }
          });
        }
      });
      res.send(result);
    }); 
  });
});
router.post('/invite-out', function(req, res){
  var inviteUser;
  var actInv;
  var User = require('./models/user');
  User.findOne({id: req.body.user}, function(err, doc){
    if(err){
      console.log(err);
    }
    else{
      console.log(doc);
      actInv = {invited: [doc]};
      inviteUser = req.body.user;
      pub.publish('inviteQue'+inviteUser, {user: inviteUser, /* activity */});
    }
  });
});
var messUser;
var messAct;
router.post('/create-message', function(req,res){
  messUser = req.body.user;
  messAct = req.body.name;
  res.send({name:messAct});
});
router.get('/aboutEvent/:id', function(req, res){
  var activities = require('./models/activitiesModel');
  activities.findOne({_id:req.params.id}, function(err, act){
    if(err){
      console.log(err);
    }
    if(act){
      if(act.creator==req.user.id){
        res.render('partials/event.hbs', {activity:act, uCreator: true});
      }
      else{
        res.render('partials/event.hbs', {activity:act, uCreator: false});
      }
    }
  });
});
app.use('/main', router);
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
        var message = [];
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
authRouter.get('/facebook', passport.authenticate('facebook', {scope: 'email'}));
authRouter.get('/twitter', passport.authenticate('twitter'));
authRouter.get('/google', passport.authenticate('google', {scope:['profile', 'email']}));
authRouter.get('/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/main',
    failureRedirect: '/'
  }));
authRouter.get('/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: '/main',
    failureRedirect: '/'
  }));
authRouter.get('/google/callback',
  passport.authenticate('google', {
    successRedirect: '/main',
    failureRedirect: '/'
  }));
app.use('/auth', authRouter);
app.put('/change-password', function(req, res){
  var User = require('./models/user');
  User.find({'local.email': req.body.email}, function(err, user){
    if(err){
      console.log(err);
    }
    if(user.validPassword(req.body.oldPassword)){
      user.update({id: req.user}, {$set: {password: user.generateHash(req.body.newPassword)}}, function(err){
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
app.route('/report-violation')
  .get(function(req, res){
    console.log(req);
  })
  .post(function(req, res){
    console.log(req);
  });

//*********************************************************
//*********************AUTHENTICATION**********************
//*********************************************************
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    console.log('redirect');
    res.redirect('/');
  }
}
