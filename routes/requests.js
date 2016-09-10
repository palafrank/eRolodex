var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var RequestModule = require('../models/request.js');
var RequestList = RequestModule.RequestList;
var Request = RequestModule.Request;
var Verify = require('./verify');
var requestRouter = express.Router();
requestRouter.use(bodyParser.json());

requestRouter.route('/')

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

requestRouter.route('/reject')
.delete(Verify.verifyOrdinaryUser,
          function(req, res, next) {
  console.log(req.body.profileOwner);
  if(req.decoded._doc._id != req.body.ownerId) {
    return res.status(404).json({"status":"FAILURE", "message": "Unauthorized"});
  }
  RequestList.findOne({ownerId : req.body.ownerId},
        function(err, requestList) {
    if(err) {
      console.log(err);
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

module.exports = requestRouter;
