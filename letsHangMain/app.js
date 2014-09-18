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

//server.listen(3000);

server.listen(80);

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
  console.log(user.emailAddr);
  userCollection.findOne({emailAddr: user.emailAddr}, function(err, doc){
    if(err!=null){
      console.log(err);
    }
    else{
      if(bcrypt.compareSync(user.password, doc.password)){
        res.send({status:'success', newUser: {name:doc.name,email:doc.email}});
      }
      else{
        res.send({status:'incorrect email or password'});
      }
      return doc;
    }
  });
});
app.post('/register-submit', function(req,res){
  var user = {
    name: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null),
    signUpDate: new Date(),
    lastLogin: new Date()
  };
  var acntExists = null; 
  userCollection.find({email:user.email}, function(err, docs){
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
    res.send({status:'success', newUser: {name: user.name, emailAddr: user.email}});
  }
  else{
    res.send({status:'account exists'});
  }
});
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
app.get('/add/:service', authom.app);

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

credCollection.find(function(err, docs){
  for(var i = 0; i<docs.length; i++){
    switch(docs[i].name){
      case 'facebook':
        authom.createServer({
          service: 'facebook',
          id: docs[i].clientID,
          secret: docs[i].clientSecret,
          scope: []
        });
        break;
      case 'twitter':
        authom.createServer({ 
          service: 'twitter',
          id: docs[i].clientID,
          secret: docs[i].clientSecret
        });
        break;
      case 'google':
        authom.createServer({ 
          service: 'google',
          id: docs[i].clientID,
          secret: docs[i].clientSecret,
          scope: ""
        });
        break;
    }
  }
});

authom.on('auth', function(req, res, data){
  console.log('req: '+req+'\nres: '+res+'\n data: '+data);
});
/*function facebookAuthReq(user){
  var facebookCreds = {
    service: 'facebook',
    id: null,
    secret: null,
    scope: [],
    fields: ["name"]
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
    console.log(facebookKey);
    facebookKey.on("auth", function(req, res, data){
      console.log('auth');
      console.log('req: '+req+'\n res: '+res+'\n data: '+data);
      //userCollection.update(user, {facebookID: });
    });
  });
}
function twitterAuthReq(user){
  var twitterCreds = {
    service: 'twitter',
    id: null,
    secret: null
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
    scope: ""
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
}*/
