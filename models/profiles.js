var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var webSchema = new Schema ( {
  name: String,
  link: String
});

var emailSchema = new Schema ({
  name: String,
  email: String
});

var phoneSchema = new Schema ( {
    name: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
});

var addressSchema = new Schema ({
    name: {
      type: String,
      required: true,
    },
    address1: {
      type: String,
      required: true,
    },
    address2: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      required: true,
    },
});

var infoSchema = new Schema({
  profileName: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  middleInitial: {
    type: String,
    requred: false
  },
  title: {
    type: String
  },
  profilePicture: {
    type: String
  },
  defaultProfile: {
    type: Boolean,
    default: false
  },
  phone: [phoneSchema],
  address: [addressSchema],
  email: [emailSchema],
  web: [webSchema],
});

var profilesSchema = new Schema({
    profileOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    profiles: [infoSchema],
    photos: [String]
  },
  {
    timestamps: true
  }
);

var Profiles = mongoose.model('Profiles', profilesSchema);
var ProfileData = mongoose.model('ProfileData', infoSchema);

module.exports.Profiles = Profiles;
module.exports.ProfileData = ProfileData;
