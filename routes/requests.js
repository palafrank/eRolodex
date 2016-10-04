var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var RequestModule = require('../models/request.js');
var RequestList = RequestModule.RequestList;
var ContactList = RequestModule.ContactList;
var Request = RequestModule.Request;
var Verify = require('./verify');
var requestRouter = express.Router();
requestRouter.use(bodyParser.json());

requestRouter.route('/')

.get(Verify.verifyOrdinaryUser,
        function(req, res, next) {

    console.log("Request owner is " + req.decoded._doc._id);
    RequestList.findOne({ownerId:req.decoded._doc._id})
    .populate('requests.profileId')
    .exec(function(err, requestList) {
      if(err) {
        console.log("Error in request");
        return res.status(404).json(null);
      } else {
        console.log("Passed request " + requestList);
        return res.status(200).json(requestList);
      }
    })

    /*
    console.log("Got the request");
    RequestList.findOne({profileOwner:req.decoded._doc._id},
                                function (err, requestList) {
      if(err) {
        console.log("Error finding the list");

      } else {
        console.log("Found the list");
      }
      return res.status(200).json(requestList);
    })
    */

})

.post(Verify.verifyOrdinaryUser,
          function(req, res, next) {
  //console.log(req);
  RequestList.findOneAndUpdate({ownerId:req.body.ownerId},
                        {$setOnInsert: {ownerId:req.body.ownerId}},
                        {upsert:true, new: true},
                        function(err, requestList) {
    if(err) {
      res.status(404).json({"status":"FAILURE"});
    } else {
      var found = false;
      if(!requestList.requests.length) {
        requestList.requests.push(req.body.request);
      } else {
        for(var i = 0; i < requestList.requests.length; i++) {
          if(requestList.requests[i].profileOwner
                      === req.body.request.profileOwner) {
            requestList.requests[i] = req.body.request;
            found = true;
          }
          if(!found) {
            requestList.requests.push(req.body.request);
          }
        }
      }
      requestList.save(function(err, rl) {
        if(err) {
          return res.status(404).json({"status":"FAILURE", "message": err.message});
        }  else {
          return res.status(200).json({"status":"SUCCESS"});
        }
      });
    }
  });
})

//Function for requester to delete his/her request
.delete(Verify.verifyOrdinaryUser,
          function(req, res, next) {
  //console.log(req.body.profileOwner);
  if(req.decoded._doc._id != req.body.profileOwner) {
    return res.status(404).json({"status":"FAILURE", "message": "Unauthorized"});
  }
  RequestList.findOne({ownerId : req.body.ownerId},
        function(err, requestList) {
    if(err) {
      //console.log(err);
      return res.status(404).json({"status":"FAILURE", "message":err.message});
    } else {
      for(var i=0; i<requestList.requests.length; i++) {
        if(requestList.requests[i].profileOwner == req.body.profileOwner)
          requestList.requests.splice(i, 1);
      }
      requestList.save(function(err, rl) {
        if(err) {
          return res.status(404).json({"status":"FAILURE", "message": err.message});
        }  else {
          return res.status(200).json({"status":"SUCCESS"});
        }
      });
    }
  })
})

//User rejects a request to connect
requestRouter.route('/reject')
.delete(Verify.verifyOrdinaryUser,
          function(req, res, next) {
  RequestList.findOne({ownerId : req.decoded._doc._id},
        function(err, requestList) {
    if(err) {
      console.log(err);
      return res.status(404).json({"status":"FAILURE", "message":err.message});
    } else {
      for(var i=0; i<requestList.requests.length; i++) {
        if(requestList.requests[i].profileOwner == req.query.profileOwner)
          requestList.requests.splice(i, 1);
      }
      requestList.save(function(err, rl) {
        if(err) {
          return res.status(404).json({"status":"FAILURE", "message": err.message});
        }  else {
          return res.status(200).json(rl);
        }
      });
    }
  })
})

requestRouter.route('/accept')
.delete(Verify.verifyOrdinaryUser,
          function(req, res, next) {
  console.log(req.body.profileOwner);
  RequestList.findOne({ownerId : req.decoded._doc._id},
        function(err, requestList) {
    var accept = [];
    if(err) {
      console.log(err);
      return res.status(404).json({"status":"FAILURE", "message":err.message});
    } else {
      for(var i=0; i<requestList.requests.length; i++) {
        if(requestList.requests[i].profileOwner == req.body.profileOwner)
          accept = requestList.requests.splice(i, 1);
      }
      requestList.save(function(err, rl) {
        if(err) {
          return res.status(404).json({"status":"FAILURE", "message": err.message});
        }  else {
          return res.status(200).json({"status":"SUCCESS"});
        }
      });
    }
  })

  if(accept.length != 1) {
    console.log("Unexpected number of request accepted " + accept.length);
    return res.status(404).json({"status":"FAILURE"});
  }

  ContactList.findOneAndUpdate({ownerId: req.decoded._doc._id},
                        {$setOnInsert: {ownerId: req.decoded._doc._id}},
                        {upsert:true, new: true},
                        function(err, contactList) {
    if(err) {

    } else {
      var found = false;
      if(!contactList.contacts.length) {
          contactList.contacts.push(accept[0]);
        } else {
          for(var i = 0; i < contactList.contacts.length; i++) {
            if(contactList.contacts[i].profileOwner
                        === accept[0].profileOwner) {
              contactList.contacts[i] = accept[0];
              found = true;
            }
            if(!found) {
              contactList.contacts.push(accept[0]);
            }
          }
        }
        contactList.save(function(err, rl) {
          if(err) {
            return res.status(404).json({"status":"FAILURE", "message": err.message});
          }  else {
            return res.status(200).json({"status":"SUCCESS"});
          }
        });
      }
    })
})

module.exports = requestRouter;
