module.exports.toBase64 = function(str) {
  return new Buffer(str).toString("base64")
}

module.exports.toFnBase64 = function(str) {
  var lines = str.split(/\r\n|\r|\n/).map(function(line){
    return line + "\n";
  });
   return {
    "Fn::base64" : {"Fn::Join": ["",lines]}
  }
}
