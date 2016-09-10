var mongoose = require('mongoose');
var Profiles = require('./profiles.js');
var Schema = mongoose.Schema;

var requestSchema = new Schema({
    profileOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProfileData'
    }
  },
  {
    timestamps: true
  }
);

var requestListSchema = new Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requests: [requestSchema]
});

var contactListSchema = new Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contacts: [requestSchema]
});

var RequestList = mongoose.model('RequestList', requestListSchema);
var Request = mongoose.model('Request', requestSchema);
var ContactList = mongoose.model('ContactList', contactListSchema);

module.exports.RequestList = RequestList;
module.exports.Request = Request;
module.exports.Contacts = ContactList;
