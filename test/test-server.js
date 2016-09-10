process.env.NODE_ENV = 'test';
var profiles = require('./db');
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);

describe('eRolodexLocalUser', function() {
  var token;
  var userId;
  var profileId;
  it('should register a new user on /users/register POST', function(done) {
    chai.request(server)
      .post('/users/register')
      .send({"username":"ann", "password":"frank"})
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('status');
        res.body.status.should.equal('Registration Successful!');
        done();
      });
  }) ;
  it('should fail registering a duplicate user on /users/register POST', function(done) {
    chai.request(server)
      .post('/users/register')
      .send({"username":"ann", "password":"frank"})
      .end(function(err, res) {
        res.should.have.status(500);
        res.should.be.json;
        res.body.should.have.property('status');
        res.body.status.should.equal('Registration Failed!');
        done();
      });
  }) ;
  it('should login a new user on /users/login POST', function(done) {
    chai.request(server)
      .post('/users/login')
      .send({"username":"ann", "password":"frank"})
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('status');
        res.body.status.should.equal('Login successful!');
        res.body.should.have.property('token');
        res.body.should.have.property('userId');
        token = res.body.token;
        userId = res.body.userId;
        done();
      });
  });
  it('New user should have a profiles container /profiles GET', function(done) {
    chai.request(server)
      .get('/profiles')
      .set('x-access-token', token)
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body[0].should.have.property('profileOwner');
        res.body[0].profileOwner.should.equal(userId);
        done();
      });
  });
  it('should add a new profile for the user on /profiles POST', function(done) {
    chai.request(server)
      .post('/profiles')
      .set('x-access-token', token)
      .send({
        "profileName" : "Family",
        "firstName" : "Ann",
        "lastName" : "Manavalan",
        "middleInitial" : "L",
        "phone": [
          {"name": "home", "number":"5106765218"}
        ]
      })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('status');
        res.body.status.should.equal('SUCCESS');
        done();
      });
  });
  it('should get the profile information of the user on /profiles GET', function(done) {
    chai.request(server)
    .get('/profiles')
    .set('x-access-token', token)
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json;
      res.body[0].should.have.property('profileOwner');
      res.body[0].profileOwner.should.equal(userId);
      res.body[0].should.have.property('profiles');
      res.body[0].profiles[0].should.have.property('profileName');
      res.body[0].profiles[0].profileName.should.equal('Family');
      done();
    });
  });
  it('should add a second profile of the user on /profiles POST', function(done) {
    chai.request(server)
      .post('/profiles')
      .set('x-access-token', token)
      .send({
        "profileName" : "Work",
        "firstName" : "Ann",
        "lastName" : "Manavalan",
        "middleInitial" : "L",
        "phone": [
          {"name": "home", "number":"5106765218"}
        ]
      })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('status');
        res.body.status.should.equal('SUCCESS');
        done();
      });
  });
  it('should get the profile information of the user with 2 profiles on /profiles GET', function(done) {
    chai.request(server)
    .get('/profiles')
    .set('x-access-token', token)
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json;
      res.body[0].should.have.property('profileOwner');
      res.body[0].profileOwner.should.equal(userId);
      res.body[0].should.have.property('profiles');
      res.body[0].profiles.should.have.length(2);
      res.body[0].profiles[0].should.have.property('profileName');
      res.body[0].profiles[0].profileName.should.equal('Family');
      res.body[0].profiles[1].should.have.property('profileName');
      res.body[0].profiles[1].profileName.should.equal('Work');
      profileId = res.body[0].profiles[1]._id;
      done();
    });
  });
  it('should delete a specific profile of the user on /profiles/<id> DELETE', function(done) {
    chai.request(server)
      .del('/profiles/' + profileId)
      .set('x-access-token', token)
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('profileOwner');
        res.body.profileOwner.should.equal(userId);
        res.body.should.have.property('profiles');
        res.body.profiles.should.have.length(1);
        done();
      });
  });
  it('should delete all profiles of the user on /profiles DELETE', function(done) {
    chai.request(server)
      .del('/profiles')
      .set('x-access-token', token)
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('profileOwner');
        res.body.profileOwner.should.equal(userId);
        res.body.should.have.property('profiles');
        res.body.profiles.should.have.length(0);
        done();
      });
  });
  it('should logout a user on /users/logout GET', function(done) {
    chai.request(server)
      .get('/users/logout')
      .set('x-access-token', token)
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      })
  });
  it('should fail to fetch profile on /profiles GET', function(done) {
    chai.request(server)
    .get('/profiles')
    .set('x-access-token', token)
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json;
      res.body[0].should.have.property('profileOwner');
      res.body[0].profileOwner.should.equal(userId);
      res.body[0].should.have.property('profiles');
      done();
    });
  });
  it('should deregister a user on /register DELETE', function(done) {
    chai.request(server)
      .del('/users/register')
      .set('x-access-token', token)
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('status');
        res.body.status.should.equal('Deregistration Successful!');
        done();
      });
  });
});


describe('eRolodexUserInfo', function() {
  var tokens = [];
  var userIds = [];
  var profileId;
  var users = [
    {"username":"ann", "password":"frank"},
    {"username":"frank", "password":"ann"},
    {"username":"tobey", "password":"maria"},
    {"username":"maria", "password":"tobey"}
  ];
  it('should register a new user on /users/register POST', function(done) {
    var responseIndex = 0;
    for(var i =0; i < users.length; i++) {
      chai.request(server)
        .post('/users/register')
        .send(users[i])
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('status');
          res.body.status.should.equal('Registration Successful!');
          responseIndex++;
          if(responseIndex === users.length)
            done();
        });
    };
  });

  it('should login a new user on /users/login POST', function(done) {
    var responseIndex = 0;
    for(var i =0; i < users.length; i++) {
      chai.request(server)
        .post('/users/login')
        .send(users[i])
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('status');
          res.body.status.should.equal('Login successful!');
          res.body.should.have.property('token');
          res.body.should.have.property('userId');
          tokens.push(res.body.token);
          userIds.push(res.body.userId);
          responseIndex++;
          if(responseIndex === users.length)
            done();
        });
    }
  });

  it('should add a new profile for the user on /profiles POST', function(done) {
    var expectedResponse = 0;
    var responseIndex = 0;

    for(var i =0; i < profiles.profiles.length; i++) {
        expectedResponse += profiles.profiles[i].length;
    }

    for(var i =0; i < profiles.profiles.length; i++) {
      for(var j = 0; j < profiles.profiles[i].length; j++) {
        chai.request(server)
          .post('/profiles')
          .set('x-access-token', tokens[i])
          .send(profiles.profiles[i][j])
          .end(function(err, res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('status');
            res.body.status.should.equal('SUCCESS');
            responseIndex++;
            if(responseIndex === expectedResponse)
              done();
          });
      }
    }
  });

  it('should get the profile information of the user on /profiles GET', function(done) {
    var expectedResponse = 0;
    var responseIndex = 0;
    expectedResponse += profiles.profiles.length;
    for(var i = 0; i < profiles.profiles.length; i++) {
      chai.request(server)
      .get('/profiles')
      .set('x-access-token', tokens[i])
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body[0].should.have.property('profileOwner');
        res.body[0].profileOwner.should.equal(userIds[responseIndex]);
        res.body[0].should.have.property('profiles');
        res.body[0].profiles.should.have.length(profiles.profiles[responseIndex].length);
        responseIndex++;
        if(responseIndex === expectedResponse)
          done();
      });
    }
  });
  it('should deregister a user on /register DELETE', function(done) {
    var responseIndex = 0;
    for(var i =0; i < users.length; i++) {
      chai.request(server)
        .del('/users/register')
        .set('x-access-token', tokens[i])
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('status');
          res.body.status.should.equal('Deregistration Successful!');
          responseIndex++;
          if(responseIndex === users.length)
            done();
        });
      }
    });
});

describe('eRolodexUserRequest', function() {
  var tokens = [];
  var userIds = [];
  var profileId;
  var requestProfileId = [];
  var users = [
    {"username":"ann", "password":"frank"},
    {"username":"frank", "password":"ann"},
    {"username":"tobey", "password":"maria"},
    {"username":"maria", "password":"tobey"}
  ];
  it('should register a new user on /users/register POST', function(done) {
    var responseIndex = 0;
    for(var i =0; i < users.length; i++) {
      chai.request(server)
        .post('/users/register')
        .send(users[i])
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('status');
          res.body.status.should.equal('Registration Successful!');
          responseIndex++;
          if(responseIndex === users.length)
            done();
        });
    };
  });

  it('should login a new user on /users/login POST', function(done) {
    var responseIndex = 0;
    for(var i =0; i < users.length; i++) {
      chai.request(server)
        .post('/users/login')
        .send(users[i])
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('status');
          res.body.status.should.equal('Login successful!');
          res.body.should.have.property('token');
          res.body.should.have.property('userId');
          tokens.push(res.body.token);
          userIds.push(res.body.userId);
          responseIndex++;
          if(responseIndex === users.length)
            done();
        });
    }
  });

  it('should add a new profile for the user on /profiles POST', function(done) {
    var expectedResponse = 0;
    var responseIndex = 0;

    for(var i =0; i < profiles.profiles.length; i++) {
        expectedResponse += profiles.profiles[i].length;
    }

    for(var i =0; i < profiles.profiles.length; i++) {
      for(var j = 0; j < profiles.profiles[i].length; j++) {
        chai.request(server)
          .post('/profiles')
          .set('x-access-token', tokens[i])
          .send(profiles.profiles[i][j])
          .end(function(err, res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('status');
            res.body.status.should.equal('SUCCESS');
            responseIndex++;
            if(responseIndex === expectedResponse)
              done();
          });
      }
    }
  });

  it('should get the profile information of the user on /profiles GET', function(done) {
    var expectedResponse = 0;
    var responseIndex = 0;
    expectedResponse += profiles.profiles.length;
    for(var i = 0; i < profiles.profiles.length; i++) {
      chai.request(server)
      .get('/profiles')
      .set('x-access-token', tokens[i])
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body[0].should.have.property('profileOwner');
        res.body[0].profileOwner.should.equal(userIds[responseIndex]);
        res.body[0].should.have.property('profiles');
        res.body[0].profiles.should.have.length(profiles.profiles[responseIndex].length);
        requestProfileId.push(res.body[0].profiles[0]);
        responseIndex++;
        if(responseIndex === expectedResponse)
          done();
      });
    }
  });

  it('should request a contact POST', function(done) {
    var responseIndex = 0;

      for(var i = 0; i < requestProfileId.length; i++) {
        var sendStr = {
          "ownerId" : userIds[0],
          "request" :
          {
            "profileOwner" : userIds[i],
            "profileId" : requestProfileId[i]
          }
        };
        chai.request(server)
          .post('/request')
          .set('x-access-token', tokens[i])
          .send(sendStr)
          .end(function(err, res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('status');
            res.body.status.should.equal('SUCCESS');
            responseIndex++
            if(responseIndex === requestProfileId.length) {
              done();
            }
          });
      }
  });

  it('should delete a request DEL', function(done) {
    var responseIndex = 0;
    var sendStr = {
        "ownerId" : userIds[0],
        "profileOwner" : userIds[1]
    };

      chai.request(server)
        .del('/request')
        .set('x-access-token', tokens[1])
        .send(sendStr)
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('status');
          res.body.status.should.equal('SUCCESS');
          done();
        });
  });

  it('should try and fail to delete a request for another user DEL', function(done) {
    var responseIndex = 0;
    var sendStr = {
        "ownerId" : userIds[0],
        "profileOwner" : userIds[1]
    };

      chai.request(server)
        .del('/request')
        .set('x-access-token', tokens[2])
        .send(sendStr)
        .end(function(err, res) {
          res.should.have.status(404);
          res.should.be.json;
          res.body.should.have.property('status');
          res.body.status.should.equal('FAILURE');
          res.body.should.have.property('message');
          res.body.message.should.equal('Unauthorized');
          done();
        });
  });


  it('should deregister a user on /register DELETE', function(done) {
    var responseIndex = 0;
    for(var i =0; i < users.length; i++) {
      chai.request(server)
        .del('/users/register')
        .set('x-access-token', tokens[i])
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('status');
          res.body.status.should.equal('Deregistration Successful!');
          responseIndex++;
          if(responseIndex === users.length)
            done();
        });
      }
    });

});
