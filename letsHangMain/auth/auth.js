var localStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var twitterStrategy = require('passport-twitter').Strategy;
var googleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require('../models/user');//user model
var Creds = require('./creds');// auth credentials

module.exports = function(passport){
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});
	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user);
		});
	});
	passport.use('local-signup', new localStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done){
		process.nextTick(function(){
			User.findOne({'local.email':email}, function(err,user){
				if(err){
					return done(err);
				}
				if(user){
					return done(null, false, {signUpMessage:'User Already Exists'});
				}
				else{
					var newUser = new User();
					newUser.local.email = email;
					newUser.local.password = newUser.generateHash(password);
					newUser.local.name = req.body.firstName;
					newUser.local.lastName = req.body.lastName;
					newUser.local.signUpDate = new Date();
					newUser.local.lastLogin = new Date();
					newUser.save(function(err){
						if(err){
							console.log(err);
						}
						else{
							return done(null, newUser);
						}
					});
				}
			});
		});
	}));
	passport.use('local-login', new localStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done){
		User.findOne({'local.email':email}, function(err, user){
			if(err){
				return done(err);
			}
			if(!user){
				return done(null, false, {loginMessage:'User does not exist'});
			}
			if(!user.validPassword(password)){
				return done(null, false, {loginMessage:'Oops, wrong password'});
			}
			return done(null, user);
		});
	}));
	passport.use(new facebookStrategy({
		clientID: Creds.facebookAuth.clientID,
		clientSecret: Creds.facebookAuth.clientSecret,
		callbackURL: Creds.facebookAuth.callbackURL,
		passReqToCallback: true
	},
	function(req, token, refreshToken, profile, done){
		process.nextTick(function(){
			if(!req.user){
				User.findOne({'facebook.id':profile.id}, function(err, user){
					if(err){
						return done(err);
					}
					if(user){
						return done(null, user);
					}
					else{
						var newUser = new User();
						newUser.facebook.id = profile.id;
						newUser.facebook.token = token;
						newUser.facebook.name = profile.name.givenName+' '+profile.name.familyName;
						newUser.facebook.email = profile.emails[0].value;
						newUser.save(function(err){
							if(err){
								console.log(err);
							}
							else{
								return done(null, newUser);
							}
						});
					}
				});
			}
			else{
				var user = req.user;
				user.facebook.id = profile.id;
				user.facebook.token = token;
				user.facebook.name = profile.name.givenName+' '+profile.name.familyName;
				user.facebook.email = profile.emails[0].value;
				user.save(function(err){
					if(err){
						console.log(err);
						return;
					}
					else{
						return done(null, user);
					}
				});
			}
		});
	}));
	passport.use(new twitterStrategy({
		consumerKey: Creds.twitterAuth.clientID,
		consumerSecret: Creds.twitterAuth.clientSecret,
		callbackURL: Creds.twitterAuth.callbackURL,
		passReqToCallback: true
	},
	function(token, tokenSecret, profile, done){
		process.nextTick(function(){
			if(!req.user){
				User.findOne({'twitter.id':profile.id}, function(err, user){
					if(err){
						return done(err);
					}
					if(user){
						return done(null, user);
					}
					else{
						var newUser = new User();
						newUser.twitter.id = profile.id;
						newUser.twitter.token = token;
						newUser.twitter.username = profile.username;
						newUser.twitter.displayName = profile.displayName;
						newUser.save(function(err){
							if(err){
								console.log(err);
							}
							else{
								return done(null, newUser);
							}
						});
					}
				});
			}
			else{
				var user = req.user;
				user.twitter.id = profile.id;
				user.twitter.token = token;
				user.twitter.username = profile.username;
				user.twitter.displayName = profile.displayName;
				user.save(function(err){
					if(err){
						console.log(err);
					}
					else{
						return done(null, user);
					}
				});
			}
		});
	}));
	passport.use(new googleStrategy({
		clientID: Creds.googleAuth.clientID,
		clientSecret: Creds.googleAuth.clientSecret,
		callbackURL: Creds.googleAuth.callbackURL,
		passReqToCallback: true
	},
	function(token, refreshToken, profile, done){
		process.nextTick(function(){
			if(!req.user){
				User.findOne({'google.id':profile.id}, function(err, user){
					if(err){
						return done(err);
					}
					if(user){
						return done(null, user);
					}
					else{
						var newUser = new User();
						newUser.google.id = profile.id;
						newUser.google.token = token;
						newUser.google.name = profile.displayName;
						newUser.google.email = profile.emails[0].value;
						newUser.save(function(err){
							if(err){
								console.log(err);
							}
							else{
								return done(null, newUser);
							}
						});
					}
				});
			}
			else{
				var user = req.user;
				user.google.id = profile.id;
				user.google.token = token;
				user.google.name = profile.displayName;
				user.google.email = profile.emails[0].value;
				user.save(function(err){
					if(err){
						console.log(err);
					}
					else{
						return done(null, user);
					}
				});
			}
		});
	}));
};
