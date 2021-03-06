var express = require('express');
var bodyParser = require('body-parser');
var searchRouter = express.Router();
var passport = require('passport');
var ProfilesModule = require('../models/profiles');
var Profiles = ProfilesModule.Profiles;
var ProfileData = ProfilesModule.ProfileData;
var Verify = require('./verify');

searchRouter.use(bodyParser.json());

//searchRouter.route('/')

/* GET users listing. */
searchRouter.get('/', function(req, res, next) {
  console.log(req.query.search);
  var retProfiles = [];
  var retProfile = {};
  ProfileData.find({$text:{$search:req.query.search}}, function(err, profiles) {
    if(err) {
      res.status(500);
      console.log("Error in text search");
    } else {
      for(i=0; i<profiles.length; i++) {
        if(profiles[i].defaultProfile) {
            console.log("adding one profile");
            retProfile.profile = profiles[i];
            retProfile.profileOwner = profiles[i].profileOwner;
            retProfiles.push(retProfile);
        }
      }
      res.status(200).json(retProfiles);
    };
  });
});

module.exports = searchRouter;
