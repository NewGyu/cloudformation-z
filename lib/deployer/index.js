"use strict";

var util = require("util");
var AWS = require("aws-sdk-promise");
var Promise = require("promise");
var configSchema = require("../configSchema");
var paramUtil = require("./paramUtil.js");
var STACK_STATUS = require("./stackStatus.js");
var WatchDog = require("./watchdog");

/**
 * @class Deployer
 * @param {object} config
 * @throws {InvalidConfigError} when config is invalid.
 */
var Deployer = module.exports = function(config) {
  var validateResult = configSchema.validate(config);
  this.config = validateResult.instance;
  this.logger = this.config.logger || require("./defaultLogger.js");
  this.CFN = new AWS.CloudFormation(this.config.awsOpt);
  this.logger.info("Config is valid.")
}


/**
 * @param {object} cfnTemplate
 */
Deployer.prototype.deploy = function(cfnTemplate) {
  var self = this;

  return self.validate(cfnTemplate).then(function(){
    return self.CFN.describeStacks({
      StackName: self.config.stackName
    }).promise().then(function(req){
      return  true;
    }).catch(function(err){
      if(err.code != "ValidationError")
        return Promise.reject(err);

      return false;
    });
  }).then(function(stackIsExists){
    if(stackIsExists) {
      self.logger.info("updating... stack:", self.config.stackName);
      return self.CFN.updateStack(paramUtil.atUpdate(self.config, cfnTemplate))
        .promise().then(function(){
          return self.watchdog("update");
        });
    } else {
      self.logger.info("creating... stack:", self.config.stackName);
      return self.CFN.createStack(paramUtil.atCreate(self.config, cfnTemplate))
        .promise().then(function(){
          return self.watchdog("create");
        });
    }
  }).catch(function(err){
    self.logger.error(err);
    return Promise.reject(err);
  })
}

/**
 * @param {object} cfnTemplate
 */
Deployer.prototype.validate = function(cfnTemplate) {
  var self = this;

  //check template
  self.logger.debug(JSON.stringify(cfnTemplate,null,2));
  try {
    assertion(cfnTemplate != undefined, "Template is required!");
    assertion(typeof cfnTemplate === "object", "Template must be 'Object'");
  } catch(err) {
    self.logger.error(err);
    return Promise.reject(err);
  }
  // validate with AWS API
  return self.CFN.validateTemplate({
    TemplateBody: JSON.stringify(cfnTemplate)
  }).promise().then(function(req){
    self.logger.info("Template is valid!");
  }).catch(function(err){
    self.logger.error(err);
    return Promise.reject(err);
  });

  function assertion(satisfied, msg) {
    if(!satisfied) throw msg;
  }
}

Deployer.prototype.destroy = function() {
  var self = this;
  return self.CFN.deleteStack({
    StackName: self.config.stackName
  }).promise().then(function(req){
    self.logger.info("deleting... stack:", self.config.stackName);
    return self.watchdog("delete");
  }).catch(function(err){
    Promise.reject(err);
  })
}

Deployer.prototype.watchdog = function(action) {
  var self = this;
  var wd = new WatchDog(self.config, self.CFN);
  return new Promise(function(resolve, reject){
    wd.on("receive",function(events){
      events.forEach(function(e){
        console.log(e.Timestamp, e.ResourceType, e.LogicalResourceId, e.ResourceStatus);
        if(e.ResourceStatusReason)
          console.log(e.ResourceStatusReason);
      })
    });
    wd.on("end", function(){
      self.logger.info(wd.stackStatus);
      resolve();
    });
    wd.on("abend", function(){
      self.logger.warn(wd.stackStatus);
      reject(new Error("Abnormal End."));
    });
    wd.on("error", function(err){
      reject(err);
    });

    wd.watchUntil({
      isNormalEnd: function(st) {
        return STACK_STATUS[action].end.indexOf(st) > -1;
      },
      isAbnormalEnd: function(st) {
        return STACK_STATUS[action].abend.indexOf(st) > -1;
      }
    });
  });
}
