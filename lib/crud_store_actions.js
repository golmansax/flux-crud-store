'use strict';

var assign = require('object-assign');
var extend = require('Backbone').Collection.extend;

var CrudStoreActions = function () {
};
CrudStoreActions.extend = extend;
CrudStoreActions.bindTo = function(Store) {
  var BoundActions = this.bind(Store);
  return new BoundActions();
};

assign(CrudStoreActions.prototype, {
  create: function (data) {
    var model = new this._storage.model(data);
    this._storage.add(model);
  },

  createAndSave: function (data) {
    this._storage.create(data);
  },

  update: function (id, data) {
    this._storage.get(id).set(data);
  },

  updateAndSave: function (id, data) {
    var model = this._storage.get(id);
    model.set(data);
    model.save();
  },

  destroy: function (id) {
    this._storage.remove(id);
  },

  destroyAndSave: function (id) {
    this._storage.get(id).destroy();
  },

  load: function (models) {
    this._storage.reset(models);
  },

  fetchAll: function () {
    this._fetchingAll = true;
    this._storage.fetch({
      silent: true,
      success: function () {
        this._fetchingAll = false;
      }.bind(this)
    });
  },

  save: function (id) {
    var model = this._storage.get(id);
    model.save();
  }
});

module.exports = CrudStoreActions;
