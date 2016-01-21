"use strict";

var Deployer = require("../deployer");

var EasyCommander = module.exports = function(config, template) {
  this.template = template;
  this.deployer = new Deployer(config);
  this.config = this.deployer.config;
  this.logger = this.config.logger || require("./configSchema/defaultLogger");
}

EasyCommander.prototype.exec = function(argv) {
  var self = this;
  var commander = require("commander");

  commander.command("deploy")
    .description("create or update your stack [" + self.config.stackName + "].")
    .action(function(){
      self.logger.info("Deploying ...", self.config.stackName);
      self.deployer.deploy(self.template).then(function(){
        self.logger.info("Deploy finished.");
      }).catch(function(err){
        self.logger.error("Cannot deploy !", err);
        process.exit(1);
      })
    });

  commander.command("validate")
    .description("validate your template.")
    .action(function(){
      self.deployer.validate(self.template).then(function(){
        self.logger.info("validate finished.");
      }).catch(function(err){
        self.logger.error("validate failed !\n", err);
        process.exit(1);
      })

    });

  commander.command("balus!")
    .description("WARNING!! **delete** your stack [" + self.config.stackName + "].")
    .action(function(){
      self.logger.info("Destroying ...", self.config.stackName);
      self.deployer.destroy().then(function(){
        self.logger.info("Destroied.");
      }).catch(function(err){
        self.logger.error("Cannot destroy !\n", err);
        process.exit(1);
      })
    });

  commander.command("reborn!")
    .description("WARNING!! **delete** and create your stack [" + self.config.stackName + "].")
    .action(function(){

    });


  //to display "help" when no args
  if(argv.length < 3) argv.push("--help");

  commander.parse(argv);
}
