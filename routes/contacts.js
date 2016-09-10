var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var RequestModule = require('../models/request.js');
var RequestList = RequestModule.RequestList;
var Request = RequestModule.Request;
var Contacts = RequestModule.Contacts;
var Verify = require('./verify');
var contactRouter = express.Router();
contactRouter.use(bodyParser.json());

contactRouter.route('/')
