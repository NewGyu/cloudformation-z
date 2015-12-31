module.exports.toBase64 = function(str) {
  return new Buffer(str).toString("base64")
}

module.exports.toFnBase64 = function(str) {
  var lines = str.split(/\r\n|\r|\n/).map(function(line){
    return resolveRef(line + "\n");
  }).reduce(function(prev,curr){
    return prev.concat(curr);
  },[]);
  return {"Fn::Base64" : {"Fn::Join": ["",lines]}}
}

function resolveRef(str) {
  var regex = /(\{\s*\"Ref\"\s*:\s*\"[^\"]+\"\s*\})/ig;
  return str.split(regex).map(function(token){
    if(token.match(regex)) {
      return JSON.parse(token);
    } else {
      return token;
    }
  });
}
