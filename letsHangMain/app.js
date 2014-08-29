var express = require('express');

var app = express();

var mongojs = require('mongojs');

var db = mongojs('54.191.16.144:27017/peeps'); //54.191.16.144

var userCollection = db.collection('users');

var activitiesCollection = db.collection('activities');

var messageCollection = db.collection('messages');

var locationCollection = db.collection('locations');

//var maps = require('google-maps');

var passport = require('passport');

var bcrypt = require('bcrypt-nodejs');

var restClient = require('node-rest-client').Client;

var rClient = new restClient();

var hbs= require('express-hbs');

var http = require('http');

var server = http.createServer(app);

var io = require('socket.io').listen(server);

server.listen(3000);

var path = require('path');

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
app.post('/login-submit', function(req, res){
  var user = req.body;
  var acntBool = false;
  userCollection.findOne(user, function(err, docs){
    if(err!=null){
      console.log(err);
    }
    else{
      acntBool=true;
      if(acntBool){
        res.send({status:'success', newUser: docs.name});
      }
      else{
        res.send({status:'incorrect email or password'});
      }
      return docs;
    }
  });
}
/*passport.authenticate('local-login', {
  successRedirect:'/main',
  failureRedirect:'/login'
})*/);
app.post('/register-submit', function(req,res){
  var user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    signUpDate: new Date(),
    lastLogin: new Date()
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
    res.send({status:'account exists'});
  }
});
app.get('/main', function(req,res){
  var aData = null;
  activitiesCollection.find(req.body.user, function(err,docs){
    if(err){
      console.log(err);
    }
    else{
      aData = docs;
      var mData = null; 
      messageCollection.find(req.body.user, function(err,docs){
        if(err){
          console.log(err);
        }
        else{
          mData = docs;
          var lData = null;
          locationCollection.find(req.body.user, function(err,docs){
            if(err){
              console.log(err);
            }
            else{
              lData = docs;
              var dataToSend = {
                title: 'peeps - main', 
                activity: aData, 
                messages: mData, 
                location: lData
              };
              res.render('main.hbs', dataToSend);
              return docs;
            }
          });
          return docs;
        }
      });
      return docs;
    };
  });
});
app.post('/main/locations', function(req, res){
  var lData = null;
  activitiesCollection.find(req.body.user, function(err, docs){
    if(err){
      console.log(err);
    }
    else{
      lData = docs;
      console.log(docs);
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
  //console.log(recData.location);
  //console.log('https://maps.googleapis.com/maps/api/geocode/json?address='+recData.location+'&key='+googleKey);
  rClient.get('https://maps.googleapis.com/maps/api/geocode/json?address='+recData.location+'&key='+googleKey, function(data, response){
    if(JSON.parse(data).status!='OK'){
      console.log(JSON.parse(data).status);
      return;
    }
    console.log(JSON.parse(data).results[0].geometry.location);
    result.lat = JSON.parse(data).results[0].geometry.location.lat;
    result.lng = JSON.parse(data).results[0].geometry.location.lng;
    console.log(result);
    console.log('before');
    activitiesCollection.save(result);
    locationCollection.save({_id: 1, name: recData.location, Lat: result.lat, Long: result.lng, user:result.user, })
    res.send(result);
  }); 
});
var inviteUser;
var actInv;
app.post('/main/invite-out', function(req, res){
  console.log(req.body);
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
});
//*********************************************************
//*********************AUTHENTICATION**********************
//*********************************************************
//var LocalStrategy   = require('passport-local').Strategy;
//serialize
/*passport.serializeUser(function(user, done) {
  done(null, user.id);
});*/
// used to deserialize the user
/*passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
    done(err, user);
  });
});*/
//login
/*passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallBack: true
  },
  function(req, email, password, done){
    userCollection.findOne({'email':email}, function(err, docs){
      if(err){
        console.log(err);
        return done(err);
      }
      if(!docs){
        return  done(null, false, {message: 'no user with that email'});
      }
        return done(null, false, {message: 'password invalid'});
      }
      else{
        return done(null, docs);
      }
    });
}));*/
//register
/*passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallBack: true,
  },
  function(req, email, password, done){
    process.nextTick(function (){
      userCollection.findOne({'email':email}, function (err, docs){
        if(err){
          console.log(err);
          return done(err);
        }
        if(docs){
          console.log('account exists');
          return done(null, false, {message: 'email is already registered'});
        }
        else{
          var newUser = {
            this.email: email,
            this.password: this.generateHash(password);
          };
          userCollection.save(newUser, function (err){
            if(err){
              throw err;
            }
            return done(null, newUser);
          });
        }
      });
    });
  }
}));*/
