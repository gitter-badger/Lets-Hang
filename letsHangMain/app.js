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
  res.render('main.hbs', {title: 'peeps - main'});
});
app.get('/main/activities', function(req,res){
  var data = null;
  activitiesCollection.find(req.body.user, function(err,docs){
    if(err){
      console.log(err);
    }
    else{
      data = docs;
      res.send(data);
      return docs
    };
  });
});
app.get('/main/messages', function(req,res){
  var data = null; 
  messageCollection.find(req.body.user, function(err,docs){
    if(err){
      console.log(err);
    }
    else{
      data = docs;
      res.send(data);
      return docs;
    }
  });
});
app.get('/main/locations', function(req,res){
  var data = null;
  locationCollection.find(req.body.user, function(err, docs){
    if(err){
      console.log(err);
    }
    else{
      data = docs;
      res.send(data);
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
  var data = req.body;
  var lookLat = null;
  var lookLong = null;
  var result = {};
  console.log(data);
  var addrOptions = {
    host: url,
    port: 80,
    path: 'https://maps.googleapis.com/maps/api/geocode/json?address='+data.location+'&key='+googleKey,
    method: 'POST'
  };
  http.request(addrOptions, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  }).end();
  var locOptions = {
    host: url,
    port: 80,
    path: 'https://maps.googleapis.com/maps/api/place/radarsearch/json?location='+lookLat+','+lookLong+'&key='+googleKey,
    method: 'POST'
  };
  http.request(locOptions, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  }).end();
  
});
//*********************************************************
//*************************SOCKETS*************************
//*********************************************************
/*io.sockets.on('connection', function(socket){
  console.log('socket.io started');

}):*/
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
