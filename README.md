# cloudformation-z

Wrapper of [CloudFormation SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html)

## Usage

Sample is [here](https://github.com/NewGyu/cfnz-sample).

#### Project
```shell-session
.
├── config
│   ├── default.js
│   ├── development.js
│   └── production.js
├── index.js
├── node_modules
│   └── cloudformation-z
├── package.json
└── template
    └── index.js
```

#### pakcage.json
```json
{
  "name": "cloudformation-deploy",
  "version": "1.0.0",
  "description": "cloudformation template project",
  "scripts": {
    "start": "node ./index.js"
  },
  "dependencies": {
    "config": "1.x",
    "cloudformation-z": "0.x"
  }
}
```

#### index.js
```javascript
var CFNZ = require("cloudformation-z");
var config = require("config");
var template = require("./template/index.js");

var commander = new CFNZ.EasyCommander(config, template);
commander.exec(process.argv);
```

#### template/index.js
```javascript
module.exports = {
  "AWSTemplateFormatVersion" : "2010-09-09",

  "Description" : "cloudformation template sample",
  "Parameters" : require("./parameters.js"),  //partialized template
  "Mappings": require("./mappings.js"),

  "Resources" : {
    "RepoS3" :{
      "Type": "AWS::S3::Bucket",
      "Properties": {
        "BucketName": {"Ref": "RepoS3Name"},
        "AccessControl" : "PublicRead"
      }
    },
}
```

#### config (json schema definition)

```javascript
{
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
```

See more [node-config](https://www.npmjs.com/package/config)
