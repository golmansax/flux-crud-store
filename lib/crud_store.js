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
    if (this._isFetching[id]) {
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
    var existingViewModel = this._viewModels.get(model.cid);
    if (!existingViewModel) {
      existingViewModel = new this.viewModel();
    }

    var viewModel = existingViewModel.merge(model.attributes);

    this._viewModels = this._viewModels.set(model.cid, viewModel);
    return viewModel;
  }
});

module.exports = CrudStore;
