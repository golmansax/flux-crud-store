'use strict';

var Collection = require('backbone').Collection;
var Record = require('immutable').Record;
var OrderedMap = require('immutable').OrderedMap;
var assign = require('object-assign');
var extend = Collection.extend;

var CrudStore = function () {
  this.initialize();
};
CrudStore.extend = extend;

var BACKBONE_EVENTS = 'add remove change reset sync';

assign(CrudStore.prototype, {
  collection: Collection,

  viewModel: Record,

  _loadingResponse: {
    isLoading: true
  },

  initialize: function () {
    this._collection = new this.collection();
    this._viewModels = new OrderedMap();
  },

  addChangeListener: function (callback) {
    this._collection.on(BACKBONE_EVENTS, callback);
  },

  removeChangeListener: function (callback) {
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
