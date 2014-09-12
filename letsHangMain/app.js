//*********************************************************
//************************GLOBALS*************************
//*********************************************************

var express = require('express');

var app = express();

var mongojs = require('mongojs');

var db = mongojs('54.191.16.144:27017/peeps'); //54.191.16.144

var userCollection = db.collection('users');

var activitiesCollection = db.collection('activities');

var messageCollection = db.collection('messages');

var locationCollection = db.collection('locations');

var credCollection = db.collection('creds');

var authom = require('authom');

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
  userCollection.findOne(user, function(err, docs){
    if(err!=null){
      console.log(err);
    }
    else{
      if(brcypt.compareSync(user.password, docs.password)){
        res.send({status:'success', newUser: docs.name});
      }
      else{
        res.send({status:'incorrect email or password'});
      }
      return docs;
    }
  });
});
app.post('/register-submit', function(req,res){
  var user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null),
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
  activitiesCollection.find(req.body.user, function(err,aDocs){
    if(err){
      console.log(err);
    }
    else{
      aData = aDocs;
      var mData = null; 
      messageCollection.find(req.body.user, function(err,mDocs){
        if(err){
          console.log(err);
        }
        else{
          mData = mDocs;
          var lData = null;
          locationCollection.find(req.body.user, function(err,lDocs){
            if(err){
              console.log(err);
            }
            else{
              lData = lDocs;
              var dataToSend = {
                title: 'peeps - main', 
                activity: aData, 
                messages: mData, 
                location: lData
              };
              res.render('main.hbs', dataToSend);
              return lDocs;
            }
          });
          return mDocs;
        }
      });
      return aDocs;
    };
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
    console.log(docs.length);
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
        console.log(message);
        res.render('messenger.hbs', {messages:message});
        return;
      }
    }
    console.log(message);
    res.render('messenger.hbs', {messages:message});
  });
});
app.post('/add/facebook', function(req, res){
  facebookAuthReq(req.user);
});
app.post('/add/twitter', function(req, res){
  twitterAuthReq(req.user);
});
app.post('/add/google', function(req, res){
  googleAuthReq(req.user);
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
  socket.on('send', function(msg){
    messageCollection.save(msg);
    socket.broadcast.emit('recieve',msg);
  });
});

//*********************************************************
//*********************AUTHENTICATION**********************
//*********************************************************

function facebookAuthReq(user){
  var facebookCreds = {
    service: 'facebook',
    id: null,
    secret: null,
    scope: []
  };
  var facebookKey;
  console.log('facebook auth');
  credCollection.findOne({name: facebookCreds.service}, function(err, doc){
    if(err){
      console.log(err);
      return;
    }
    facebookCreds.id = doc.clientID;
    facebookCreds.secret = doc.clientSecret;
    facebookKey = authom.createServer(facebookCreds);
    facebookKey.on("auth", function(req, res, data){
      console.log('req: '+req+'\n res: '+res+'\n data: '+data);
      //userCollection.update(user, {facebookID: });
    });
  });
}
function twitterAuthReq(user){
  var twitterCreds = {
    service: 'twitter',
    id: null,
    secret: null,
    scope: []
  };
  var twitterKey;
  console.log('twitter auth');
  credCollection.findOne({name: twitterCreds.service}, function(err, doc){
    if(err){
      console.log(err);
      return;
    }
    twitterCreds.id = doc.clientID;
    twitterCreds.secret = doc.clientSecret;
    twitterKey = authom.createServer(twitterCreds);
    twitterKey.on("auth", function(req, res, data){
      console.log('req: '+req+'\n res: '+res+'\n data: '+data);
      //userCollection.update(user, {facebookID: });
    });
  });
}
function googleAuthReq(user){
  var googleCreds = {
    service: 'google',
    id: null,
    secret: null,
    scope: []
  };
  var googleKey;
  console.log('google auth');
  credCollection.findOne({name: googleCreds.service}, function(err, doc){
    if(err){
      console.log(err);
      return;
    }
    googleCreds.id = doc.clientID;
    googleCreds.secret = doc.clientSecret;
    googleKey = authom.createServer(googleCreds);
    googleKey.on("auth", function(req, res, data){
      console.log('req: '+req+'\n res: '+res+'\n data: '+data);
      //userCollection.update(user, {facebookID: });
    });
  });
}
