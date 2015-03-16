(function(root, factory) {
  if(typeof exports === 'object') {
    module.exports = factory(require('backbone'), require('underscore'), require('immutable'));
  } else if(typeof define === 'function' && define.amd) {
    define(['backbone', 'underscore', immutable], factory);
  } else {
    root.FluxCrudStore = factory(root.Backbone, root._, root.Immutable);
  }
}(this, function(Backbone, _, Immutable) {
  var require = function(name) {
    return {'backbone': Backbone, 'underscore': _, 'immutable': Immutable}[name];
  };
