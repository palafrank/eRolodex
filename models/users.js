var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
  username: {
    type: String,
    unique: true
  },
  password: String,
  admin: {
    type: Boolean,
    default: false
  },
  defaultProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProfileData'
  },
  OauthId: String,
  OauthToken: String,

});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
