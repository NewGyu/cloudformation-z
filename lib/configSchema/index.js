"use strict";

var util = require("util");
var jsonschema = require("jsonschema");
var schema = require("./configSchema.js");
var objMerge = require("object-merge");

//extended validator. Add attribute "isFunction".
var validator = new jsonschema.Validator();
validator.attributes.isFunction = function(instance, schema, options, ctx) {
  if(typeof schema.isFunction !== "boolean")
    throw new jsonschema.SchemaError("\"isFunction\" expects boolean",schema);

  if(schema.isFunction) {
    if(instance !== undefined && typeof instance !== "function") return "Required to be a function !";
  } else {
    if(instance === "function") return "Required to be a function !";
  }
}

/**
 * @param {object} configObj
 * @throws {InvalidConfigError} when configObj is invalid
 */
module.exports.validate =  function(configObj) {
  var conf = new schema.ZConfig(configObj);
  var result = validator.validate(conf, schema.schema) || {};
  if(result.errors.length > 0) throw new InvalidConfigError(result);
  return result;
}

/**
 * @class InvalidConfigError
 */
var InvalidConfigError = module.exports.InvalidConfigError = function(validateResult) {
  var msgLines = validateResult.errors;
  msgLines.push(JSON.stringify({
    config: validateResult.instance,
    schema: validateResult.schema
  }, null, 2));
  this.message = msgLines.join("\n");
//  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
}

util.inherits(InvalidConfigError, Error);
