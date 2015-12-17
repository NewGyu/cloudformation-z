/**
 * Config Schema
 */
module.exports.schema = {
  id: "/Config",
  type: "object",
  additionalProperties: true,
  required: ["stackName","parameters"],
  properties: {
    stackName: {type: "string",minLength: 1},
    disableRollback: {type: "boolean"},
    notificationARNs: {type: "array", items: {type: "string"}},
    onFailure: {enum: ["DO_NOTHING","ROLLBACK","DELETE"]},
    parameters: {type: "object", patternProperties: {".*": {type: "string"}}},
    resourceTypes: {type: "array", items: {type: "string"}},
    tags: {type: "object", patternProperties: {".*": {type: "string"}}},
    timeoutInMinutes: {type: "number", minimum: 0},
    handler: {type: "object",
      properties: {
        progressCheckIntervalSec: {type: "number", minimum: 1},
        onEventFn: {isFunction: true},
        onDeployed: {isFunction: true}
      }
    },
    awsOpt: {type: "object"}
  }
};

//default setting
var defaultConfig = module.exports.default = {
  disableRollback: false,
  onFailure: "ROLLBACK",
  parameters: {},
  tags: {},
  timeoutInMinutes: 5,
  handler: {
    progressCheckIntervalSec: 5,
    onEventFn: undefined,
    onDeployed: undefined
  },
  awsOpt: {
    region: "ap-northeast-1"
  },
  logger: undefined
};

/**
 * @class for merge default coinfg
 */
var ZConfig = module.exports.ZConfig = function(cfg) {
  for(var k in cfg) {
    this[k] = cfg[k];
  }
};
for(var k in defaultConfig) {
  ZConfig.prototype[k] = defaultConfig[k];
}
