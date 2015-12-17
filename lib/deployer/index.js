"use strict";

var util = require("util");
var AWS = require("aws-sdk-promise");
var Promise = require("promise");
var configSchema = require("../configSchema");
var paramUtil = require("./paramUtil.js");
var stackStatus = require("./stackStatus.js");

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
console.log(req.data.Stacks[0].StackStatus)
      return  stackStatus.isInCreatableStatus(req.data.Stacks[0].StackStatus);
    }).catch(function(err){
      if(err.code != "ValidationError")
        return Promise.reject(err);

      return false;
    });
  }).then(function(stackIsExists){
    if(stackIsExists) {
      self.logger.info("update stack:", self.config.stackName);
      return self.CFN.updateStack(paramUtil.atUpdate(self.config, cfnTemplate)).promise();
    } else {
      self.logger.info("create stack:", self.config.stackName);
      return self.CFN.createStack(paramUtil.atCreate(self.config, cfnTemplate)).promise();
    }
  }).catch(function(err){
    return Promise.reject(err);
  })
}

/**
 * @param {object} cfnTemplate
 */
Deployer.prototype.validate = function(cfnTemplate) {
  var self = this;

  //check template
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
