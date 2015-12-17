"use strict";
var AWS = require("aws-sdk-promise");
var Promise = require("promise");
var configSchema = require("./lib/configSchema");
var Deployer = require("./lib/deployer");

/**
 * @return {Promise}
 */
module.exports.deploy = function(config, cfnTemplate) {
  var deployer = new Deployer(config);
  return deployer.deploy(cfnTemplate);
}


/**
 * @return {Promise}
 */
module.exports.validate = function(config, cfnTemplate) {
  var deployer = new Deployer(config);
  return deployer.validate(cfnTemplate);
}
