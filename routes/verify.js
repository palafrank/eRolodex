var User = require('../models/users');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config.js');

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};

exports.verifyOrdinaryUser = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

exports.verifyAdminUser = function (req, res, next) {

    // decode token
    if (req.decoded) {
        if (!req.decoded._doc.admin) {
          var err = new Error('You are not authenticated as admin!');
          err.status = 401;
          return next(err);
        } else {
          console.log("Successfully verfied admin privileages");
          next();
        }
    } else {
        var err = new Error('No a validated admin user');
        err.status = 403;
        return next(err);
    }
};
