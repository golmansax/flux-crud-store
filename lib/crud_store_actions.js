'use strict';

var extend = require('backbone').Collection.extend;
var _ = require('underscore');

var CrudStoreActions = function () {
};
CrudStoreActions.extend = extend;
CrudStoreActions.boundTo = function (Store) {
  var actions = new this();

  var functionAttrs = _(actions).functions();
  _(functionAttrs).each(function (attr) {
    actions[attr] = actions[attr].bind(Store);
  });

  return actions;
};

_(CrudStoreActions.prototype).extend({
  create: function (data) {
    var model = new this._collection.model(data);
    this._collection.add(model);
  },

  createAndSave: function (data) {
    this._collection.create(data);
  },

  update: function (id, data) {
    var model = this._collection.get(id);
    if (!model) {
      throw 'Cannot call update action with id: ' + id + ' because model ' +
        'not exist.';
    }

    model.set(data);
  },

  updateAndSave: function (id, data) {
    var model = this._collection.get(id);
    if (!model) {
      throw 'Cannot call update action with id: ' + id + ' because model ' +
        'not exist.';
    }

    model.set(data);
    model.save();
  },

  destroy: function (id) {
    this._collection.remove(id);
  },

  destroyAndSave: function (id) {
    this._collection.get(id).destroy();
  },

  load: function (models) {
    this._collection.reset(models);
  },

  fetchAll: function () {
    if (!this._collection.url) {
      throw 'fetchAll action requires \'url\' to be set on collection class!';
    }

    this._isFetchingAll = true;
    this._collection.fetch({
      silent: true,
      success: function () {
        this._isFetchingAll = false;
      }.bind(this)
    });
  },

  fetch: function (id) {
    if (!this._collection.url) {
      throw 'fetch action requires \'url\' to be set on collection class!';
    }

    var model = this._collection.get(id);
    if (!model) {
      model = new this._collection.model({ id: id });
      this._collection.add(model);
    }

    this._isFetching[id] = true;
    model.fetch({
      success: function () {
        this._isFetching[id] = false;
      }.bind(this)
    });
  },

  save: function (id) {
    var model = this._collection.get(id);
    if (!model) {
      throw 'Cannot call update action with id: ' + id + ' because model ' +
        'not exist.';
    }

    model.save();
  }
});

module.exports = CrudStoreActions;
