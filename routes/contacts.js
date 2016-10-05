var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var RequestModule = require('../models/request.js');
var RequestList = RequestModule.RequestList;
var ContactList = RequestModule.Contacts;
var Verify = require('./verify');
var contactRouter = express.Router();
contactRouter.use(bodyParser.json());

contactRouter.route('/')
.get(Verify.verifyOrdinaryUser,
        function(req, res, next) {
    console.log("This is here");

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

    //return res.status(200).json(null);

    console.log("Returning from here");
});

contactRouter.route('/:contactId')
.delete(Verify.verifyOrdinaryUser,
        function(req, res, next) {

  ContactList.findOne({ownerId : req.decoded._doc._id},
                function(err, contactList) {
    for(var i=0; i<contactList.contacts.length; i++) {
      if(contactList.contacts[i]._id == req.params.contactId) {
        contactList.contacts.splice(i, 1);
        found = true;
      }
    }
    if(found) {
      contactList.save(function(err, contactList) {
        if(err) {
          console.log("Failed to save contact list");
          return res.status(404).json(null);
        }
        return res.status(200).json(contactList);
      })
    } else {
      console.log("Did not find the contact to delete");
      return res.status(404).json(null);
    }
  });

});

module.exports = contactRouter;
