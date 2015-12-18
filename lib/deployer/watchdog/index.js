"use strict";

var events = require("events");
var util = require("util");
var moment = require("moment");

/**
 * @class
 */
var CfnStatusWatchDog = module.exports = function(config, cfnClient) {
  this.config = config;
  this.CFN = cfnClient;
  this.stackStatus = undefined;
  this.startTime = undefined;
  this.receivedEvents = [];
}
util.inherits(CfnStatusWatchDog, events.EventEmitter);

/**
 *
 */
CfnStatusWatchDog.prototype.watchUntil = function(cond) {
  var self = this;

  if(self.startTime == undefined) self.startTime = moment(new Date());

  self.CFN.describeStacks({
    StackName: self.config.stackName
  }).promise().then(function(req){
    self.stackStatus = req.data.Stacks[0].StackStatus;
    if(cond.isNormalEnd(self.stackStatus)) {
      self.emit("end");
    } else if(cond.isAbnormalEnd(self.stackStatus)) {
      self.emit("abend");
    } else {
      self.describeStackEvents().then(function(){
        setTimeout(function(){
          self.watchUntil(cond);
        },self.config.handler.progressCheckIntervalSec * 1000);
      })
    }
  }).catch(function(err){
    self.emit("error",err);
  });
}

CfnStatusWatchDog.prototype.describeStackEvents = function() {
  var self = this;
  var lastReceived = self.receivedEvents.length > 0 ? moment(self.receivedEvents[self.receivedEvents.length - 1].Timestamp) : self.startTime;

  return self.CFN.describeStackEvents({
    StackName: self.config.stackName
  }).promise().then(function(req){
    var receiveds = req.data.StackEvents.filter(function(ev){
      return moment(ev.Timestamp).isAfter(lastReceived);
    }).sort(function(a,b){
      var t1 = moment(a.Timestamp);
      var t2 = moment(b.Timestamp);
      if(t1.isBefore(t2)) return -1;
      if(t1.isAfter(t2)) return 1;
      return 0;
    });

    if(receiveds.length > 0) {
      Array.prototype.push.apply(self.receivedEvents, receiveds);
      self.emit("receive",receiveds);
    }
  }).catch(function(err){
    self.emit("error",err);
  })
}
