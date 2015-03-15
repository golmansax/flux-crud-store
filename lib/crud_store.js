'use strict';

var Collection = require('backbone').Collection;
var OrderedMap = require('immutable').OrderedMap;
var assign = require('object.assign');
var extend = Collection.extend;
var _ = require('underscore');

var BACKBONE_EVENTS = 'add remove change reset sync';

var CrudStore = function () {
  this.initialize();
};
CrudStore.extend = extend;

assign(CrudStore.prototype, {
  collection: Collection,

  initialize: function () {
    if (!this.viewModel) {
      throw 'viewModel must be set on the Store class';
    }

    this._collection = new this.collection();
    this._viewModels = new OrderedMap();
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
    if (this._fetchingAll) {
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
    var cachedViewModel = this._viewModels.get(model.cid);
    var viewModel;

    if (cachedViewModel) {
      viewModel = cachedViewModel.merge(model.attributes);
    } else {
      viewModel = new this.viewModel(model.attributes);
    }

    this._viewModels = this._viewModels.set(model.cid, viewModel);
    return viewModel;
  }
});

module.exports = CrudStore;
