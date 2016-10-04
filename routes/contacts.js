var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var RequestModule = require('../models/request.js');
var RequestList = RequestModule.RequestList;
var ContactList = RequestModule.ContactList;
var Verify = require('./verify');
var contactRouter = express.Router();
contactRouter.use(bodyParser.json());

contactRouter.route('/')
.get(Verify.verifyOrdinaryUser,
        function(req, res, next) {
    console.log("This is here");
    /*
    ContactList.findOne({ownerId:req.decoded._doc._id})
    .populate('contacts.profileId')
    .exec(function(err, contactList) {
      if(err) {
        console.log("Error in request");
        return res.status(404).json(null);
      } else {
        console.log("Passed request " + contactList);
        return res.status(200).json(contactList);
      }
    })
    */
    return res.status(200).json(null);

    console.log("Returning from here");
})

module.exports = contactRouter;
