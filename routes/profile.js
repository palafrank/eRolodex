var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var multer = require('multer');
var ProfilesModule = require('../models/profiles.js');
var Verify = require('./verify');
var Profiles = ProfilesModule.Profiles;
var profileRouter = express.Router();
var upload = multer({
                        dest: './public/images/',
                        /*filename: function(req, file, callback) {
                          callback(null, file.fieldname + Date.now);
                          console.log(file.fieldname);
                        }*/
                      });

profileRouter.use(bodyParser.json());

profileRouter.route('/')

.get(Verify.verifyOrdinaryUser,
      function(req, res, next) {
  Profiles.find({profileOwner:req.decoded._doc._id}, function(err, profiles) {
    if(err) {
      res.status(500);
    } else {
      res.status(200).json(profiles);
    };
  });
})

.post(Verify.verifyOrdinaryUser,
      function(req, res, next) {

  Profiles.findOne({profileOwner:req.decoded._doc._id},
                      function(err, profiles) {
    if(err) {
      res.status(504).json({"status":"FAILURE"});
    } else {
      var found = false;

      for(var i = 0; i<profiles.profiles.length; i++) {
        console.log("Modifying existing profile: " + profiles.profiles[i]._id);
        console.log("Recevied profile: " + req.body._id);

        if(profiles.profiles[i]._id == req.body._id) {
          //profiles.profiles[i] = req.body;
          found = true;
          break;
        }
      }

      if(!found) {
        console.log("Adding a new profile");
        profiles.update({$addToSet:{profiles:req.body}}, function(err, rl) {
          if(err) {
            console.log("The error is:" + err.message);
            return res.status(404).json({"status":"FAILURE"});
          }  else {
            return res.status(200).json({"status":"SUCCESS"});
          }
        });
      } else {
        console.log("Updating existing profile");
        /*
        profiles.save(function(err, rl) {
          if(err) {
            console.log(err.message);
            return res.status(404).json({"status":"FAILURE", "message": err.message});
          }  else {
            return res.status(200).json({"status":"SUCCESS"});
          }
        });
        */

        Profiles.update({_id: profiles._id, "profiles._id": req.body._id},
                        {$set: {"profiles.$":req.body}},
                          function(err, rl) {
          if(err) {
            console.log("The error is:" + err.message);
            return res.status(404).json({"status":"FAILURE"});
          }  else {
            return res.status(200).json({"status":"SUCCESS"});
          }
        });

      }
    }
  });


/*
  Profiles.findOneAndUpdate({profileOwner:req.decoded._doc._id},
                      {$addToSet:{profiles:req.body}},
                      {new: true}, function(err, profiles) {
    if(err) {
      res.status(404).json({"status":"FAILURE"});
    } else {
      res.status(200).json({"status":"SUCCESS"});
    }
  });
  */


})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
  Profiles.findOneAndUpdate({profileOwner:req.decoded._doc._id},
                                  {$set:{'profiles':[]}},
                                  {multi: true, new: true},
                                  function(err, profile) {
    if(err) {
      res.status(500).json(profile);
    } else {
      res.status(200).json(profile);
    }
  });
});

profileRouter.route('/:profileId')

.delete(Verify.verifyOrdinaryUser,
      function(req, res, next) {
  //console.log("ID: ", req.params.profileId)
  Profiles.findOneAndUpdate({profileOwner:req.decoded._doc._id},
          {$pull:{'profiles': {_id:req.params.profileId}}},
          {new:true},
          function(err, prof) {
    if(err) throw err;
    //Profiles.find({profileOwner:req.decoded._doc._id}, function(err, profiles) {
      res.status(200).json(prof);
    //})
  });
});

profileRouter.route('/image/:imageName')

.post(Verify.verifyOrdinaryUser, upload.any(), function(req, res, next) {
  console.log("Adding an image");

/*
  Profiles.findOne({profileOwner:req.decoded._doc._id},
                      function(err, profiles) {
    if(err) {
      res.status(504).json({"status":"FAILURE"});
      res.send(req.files);
    } else {
      profiles.update({$addToSet:{photos:req.files[0].filename}}, function(err, rl) {
        if(err) {
          console.log("The error is:" + err.message);
          return res.status(404).json({"status":"FAILURE"});
        } else {
          res.send(req.files);
        }
      });
    }
  });
  */
  Profiles.findOneAndUpdate({profileOwner:req.decoded._doc._id},
    {$addToSet:{photos:req.files[0].filename}}, {new : true},
    function(err, rl) {
      if(err) {
        console.log("Error adding a image " + err);
      } else {
        console.log("Added an image");
        res.send(req.files);
      }
    });
})

.get(function(req, res, next) {
  var fs = require('fs');
  console.log("This is the image tester");
  fs.readFile('public/images/' + req.params.imageName, function(err, data) {
    if (err) {
      //Error opening file. Open the empty_profile
      fs.readFile('public/images/empty_profile.png',
        function(err, defpic) {
          if(err) {
            console.log("Error opening the image");
          } else {
            console.log("Sending default profile picture");
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(defpic);
          }
      });
    } else {
      res.writeHead(200, {'Content-Type': 'image/jpeg'});
      res.end(data);
    }
  });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
  var fs = require('fs');
  console.log("Deleting image " + req.params.imageName);
  /*
  fs.unlink('public/images/' + req.params.imageName, function(err) {
    if(err) {
      console.log("Error deleting file");
    } else {
      console.log("Deleted image file");
    }
  });
  */
  fs.unlinkSync('public/images/' + req.params.imageName);

  console.log("Deleted file and moving on");
  Profiles.findOne({profileOwner:req.decoded._doc._id},
                      function(err, profiles) {
    if(err) {
      res.status(504).json({"status":"FAILURE"});
    } else {
      profiles.update({$pull:{photos:req.params.imageName}}, function(err, rl) {
        if(err) {
          console.log("The error is:" + err.message);
          return res.status(404).json({"status":"FAILURE"});
        } else {
          return res.status(200).json({"status":"SUCCESS"});
        }
      });
    }
  });

/*

  Profiles.findByIdAndUpdate({profileOwner:req.decoded._doc._id},
    {$pull:{photos:req.params.imageName}}, {new: true}, function(err, profiles) {
      if(err) {
        res.status(504).json({"status":"FAILURE"});
      } else {
        fs.unlinkSync('public/images/' + req.params.imageName);
        res.status(200).json(profiles);
      }
  });
  */


});


/*
profileRouter.route('/image/:profieId')

.get(Verify.verifyOrdinaryUser, function(req, res, next) {
  Profiles.find({profileOwner:req.decoded._doc._id}, function(err, profiles) {
    if(err) {
      res.status(500);
    } else {
      Profiles.find({_id:profiles._id, "profiles._id": req.params.profileId},
        function(err, profile) {
          if(!err) {
            var fs = require('fs');
            if(profile.profilePicture) {
              fs.readFile(profile.profilePicture, function(err, data) {
                if (!err) {
                  res.writeHead(200, {'Content-Type': 'image/jpeg'});
                  res.end(data); // Send the file data to the browser.
                } else {
                  //Need to send a shadow pic
                }
              })
            } else {
              fs.readFile('public/images/6f4a79a1f909cc489280544698f3bfa4', function(err, data) {
                if (!err) {
                  res.writeHead(200, {'Content-Type': 'image/jpeg'});
                  res.end(data); // Send the file data to the browser.
                } else {
                  //Need to send a shadow pic
                }
              })
            }
          }
        })
    };
  });
});
*/

module.exports = profileRouter;
