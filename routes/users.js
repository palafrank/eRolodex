var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/users');
var ProfilesModule = require('../models/profiles');
var Profiles = ProfilesModule.Profiles;
var Verify = require('./verify');
var blacklist = require('express-jwt-blacklist');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('List of users');
});

router.post('/register', function(req,res) {
  User.register(new User({username: req.body.username}),
  req.body.password, function(err, user) {
    if(err) {
      return res.status(500).json({status: 'Registration Failed!'});
    }
    passport.authenticate('local')(req, res, function () {
      Profiles.create({profileOwner: user._id}, function(err, profile) {
        if(err) throw err;
        return res.status(200).json({
          status: 'Registration Successful!'
        });
      });
    });
  });
});

router.delete('/register', Verify.verifyOrdinaryUser, function(req, res) {
  console.log("Okay I am here in delete");
  User.findById({_id:req.decoded._doc._id}, function(err, user) {
    if(err) {
      return res.status(401).json({status: 'User Deregistration Failed!'});
    };
    Profiles.remove({profileOwner:req.decoded._doc._id}, function(err, resp) {
      //if(err) throw err;
    });
    User.remove({_id:req.decoded._doc._id}, function(err, user) {
      if(err) {
        return res.status(500).json({status: 'User Deregistration Failed!'});
      };
      return res.status(200).json({status: 'Deregistration Successful!'});
    });
  });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }

      var token = Verify.getToken(user);
              res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token,
        userId: user._id
      });
    });
  })(req,res,next);
});

router.get('/logout', Verify.verifyOrdinaryUser, function(req, res, next) {
  req.logOut();
  blacklist.revoke(req.body.token);
  res.status(200).json({"status":"Logout Successful"});
});

router.get('/facebook', passport.authenticate('facebook'),
  function(req, res){

  });

router.get('/facebook/callback', function(req,res,next){
  passport.authenticate('facebook', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      var token = Verify.getToken(user);
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    });
  })(req,res,next);
});

module.exports = router;
