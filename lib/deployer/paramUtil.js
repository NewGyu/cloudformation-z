module.exports.atCreate = function(config, template) {
  return {
    StackName: config.stackName,
    Capabilities: ['CAPABILITY_IAM','CAPABILITY_NAMED_IAM'],
    Parameters: convertParameters(config.parameters),
    Tags: convertTags(config.tags),
    TemplateBody: JSON.stringify(template),
    TimeoutInMinutes: config.timeoutInMinutes,
    OnFailure: config.onFailure
  }
}

module.exports.atUpdate = function(config, template) {
  return {
    StackName: config.stackName,
    Capabilities: ['CAPABILITY_IAM','CAPABILITY_NAMED_IAM'],
    Parameters: convertParameters(config.parameters),
    TemplateBody: JSON.stringify(template),
  }
}

function convertParameters(paramMap) {
  return Object.keys(paramMap).map(function(k){
    return {
      ParameterKey: k,
      ParameterValue: paramMap[k],
      UsePreviousValue: false
    }
  });
}

function convertTags(tagMap) {
  return Object.keys(tagMap).map(function(k){
    return {
      Key: k,
      Value: tagMap[k]
    }
  });
}
