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
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Collection = require('backbone').Collection;
var OrderedMap = require('immutable').OrderedMap;
var extend = Collection.extend;
var _ = require('underscore');

var BACKBONE_EVENTS = 'add remove change reset sync';

var CrudStore = function () {
  this.initialize();
};
CrudStore.extend = extend;
CrudStore.instance = function () {
  return new this();
};

_(CrudStore.prototype).extend({
  collection: Collection,

  initialize: function () {
    if (!this.viewModel) {
      throw 'viewModel must be set on the Store class';
    }

    if (!this.collection) {
      throw 'collection must be set on the Store class';
    }

    this._collection = new this.collection();
    this._viewModels = new OrderedMap();
    this._isFetchingAll = false;
    this._isFetching = {};
  },

  addChangeListener: function (callback) {
    if (!_(callback).isFunction()) {
      throw 'Callback param is not a function!';
    }

    this._collection.on(BACKBONE_EVENTS, callback);
  },

  removeChangeListener: function (callback) {
    if (!_(callback).isFunction()) {
      throw 'Callback param is not a function!';
    }

    this._collection.off(BACKBONE_EVENTS, callback);
  },

  getAll: function () {
    if (this._isFetchingAll) {
      return this._loadingResponse;
    }

    // First pass is to remove any unused models
    this._viewModels.keySeq().forEach(function (key) {
      if (!this._collection.get(key)) {
        this._viewModels = this._viewModels.remove(key);
      }
    }.bind(this));

    // This updates and creates models as necessary
    this._collection.each(this._cacheViewModel.bind(this));

    return this._viewModels;
  },

  get: function (id) {
    if (this._isFetchingAll || this._isFetching[id]) {
      return this._loadingResponse;
    }

    var model = this._collection.get(id);

    if (!model) {
      return null;
    } else {
      return this._cacheViewModel(model);
    }
  },

  _loadingResponse: {
    isLoading: true
  },

  _cacheViewModel: function (model) {
    var viewModel = this._viewModels.get(model.cid);
    if (viewModel) {
      _(model.toJSON()).forEach(function (value, key) {
        viewModel = viewModel.set(key, value);
      });
    } else {
      viewModel = new this.viewModel(model.toJSON());
    }

    this._viewModels = this._viewModels.set(model.cid, viewModel);
    return viewModel;
  }
});

module.exports = CrudStore;

},{"backbone":"backbone","immutable":"immutable","underscore":"underscore"}],2:[function(require,module,exports){
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
    this._collection.get(id).set(data);
  },

  updateAndSave: function (id, data) {
    var model = this._collection.get(id);
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
    model.save();
  }
});

module.exports = CrudStoreActions;

},{"backbone":"backbone","underscore":"underscore"}],"flux-crud-store":[function(require,module,exports){
'use strict';

var CrudStore = require('./crud_store');
var CrudStoreActions = require('./crud_store_actions');

module.exports = { Store: CrudStore, Actions: CrudStoreActions };

},{"./crud_store":1,"./crud_store_actions":2}]},{},[]);
  return require('flux-crud-store');
}))
