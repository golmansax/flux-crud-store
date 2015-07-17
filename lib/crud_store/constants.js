'use strict';

var keyMirror = require('keymirror');

var ACTIONS = ['create', 'destroy', 'update'];

module.exports = {
  instance: function (prefix) {
    var constants = {};
    for (var i = 0; i < ACTIONS.length; i++) {
      constants[(prefix + '_' + ACTIONS[i]).toUpperCase()] = null;
    }

    return keyMirror(constants);
  }
};
