# cloudformation-z

Wrapper of [CloudFormation SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html)

## Usage

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
