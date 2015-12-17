"use strict";

var EasyCommander = module.exports = function(config, template) {
  this.config = config;
  this.template = template;
}

EasyCommander.prototype.exec = function(argv) {
  var self = this;
  var commander = require("commander");

  commander.command("deploy")
    .description("create or update your stack.")
    .action(function(){
      console.log("Deploying ...")
    });

  commander.command("destroy")
    .description("delete your stack.")
    .action(function(){
      console.log("Deleting ...")

    });

  commander.command("redeploy")
    .description("delete and create your stack.")
    .action(function(){

    });

  commander.command("validate")
    .description("validate your template.")
    .action(function(){

    });

  if(argv.length < 3) argv.push("--help");

  commander.parse(argv);
}
