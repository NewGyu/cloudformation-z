"use strict";
var Promise = require("promise");
var Deployer = require("./lib/deployer");
var commander = require("commander");

module.exports.Deployer = require("./lib/deployer");
module.exports.EasyCommander = require("./lib/easyCommander");

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
