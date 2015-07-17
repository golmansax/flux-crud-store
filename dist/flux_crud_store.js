(function(root, factory) {
  if(typeof exports === 'object') {
    module.exports = factory(require('backbone'), require('underscore'), require('immutable'));
  } else if(typeof define === 'function' && define.amd) {
    define(['backbone', 'underscore', 'immutable'], factory);
  } else {
    root.FluxCrudStore = factory(root.Backbone, root._, root.Immutable);
  }
}(this, function(Backbone, _, Immutable) {
  var require = function(name) {
    return {'backbone': Backbone, 'underscore': _, 'immutable': Immutable}[name];
  };
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
      throw 'Cannot call updateAndSave action with id: ' + id + ' because ' +
        'model not exist.';
    }

    model.set(data);
    model.save();
  },

  destroy: function (id) {
    var model = this._collection.get(id);
    if (!model) {
      throw 'Cannot call destroy action with id: ' + id + ' because model ' +
        'not exist.';
    }

    this._collection.remove(id);
  },

  destroyAndSave: function (id) {
    var model = this._collection.get(id);
    if (!model) {
      throw 'Cannot call destroyAndSave action with id: ' + id + ' because ' +
        'model not exist.';
    }

    model.destroy();
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
      throw 'Cannot call save action with id: ' + id + ' because model ' +
        'not exist.';
    }

    model.save();
  }
});

module.exports = CrudStoreActions;

},{"backbone":"backbone","underscore":"underscore"}],2:[function(require,module,exports){
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

},{"keymirror":4}],3:[function(require,module,exports){
'use strict';

var Collection = require('backbone').Collection;
var Immutable = require('immutable');
var extend = Collection.extend;
var _ = require('underscore');

var OrderedMap;
var Record;
if (Immutable) {
  OrderedMap = Immutable.OrderedMap;
  Record = Immutable.Record;
}

var BACKBONE_EVENTS = 'add remove change reset sync';

var CrudStore = function () {
  this.initialize();
};
CrudStore.extend = extend;
CrudStore.instance = function () {
  return new this();
};

function isImmutableRecord(klass) {
  if (typeof klass !== 'function') {
    return false;
  }

  var dummy = { klass: klass };
  var testModel = new dummy.klass();
  return testModel instanceof Record;
}

_(CrudStore.prototype).extend({
  collection: Collection,

  initialize: function () {
    if (this._isUsingViewModel()) {
      if (!Immutable) {
        throw 'You need to install Immutable.js to set viewModel';
      }

      if (!isImmutableRecord(this.viewModel)) {
        throw 'viewModel, if defined, must be an Immutable.Record class';
      }

      this._viewModels = new OrderedMap();
    }

    if (!this.collection) {
      throw 'collection must be set on the Store class';
    }
    this._collection = new this.collection();

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

    if (!this._isUsingViewModel()) {
      return this._collection.toJSON();
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
      if (!this._isUsingViewModel()) {
        return model.toJSON();
      }

      return this._cacheViewModel(model);
    }
  },

  _loadingResponse: {
    isLoading: true
  },

  _isUsingViewModel: function () {
    return !!this.viewModel;
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

},{"backbone":"backbone","immutable":"immutable","underscore":"underscore"}],4:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

"use strict";

/**
 * Constructs an enumeration with keys equal to their value.
 *
 * For example:
 *
 *   var COLORS = keyMirror({blue: null, red: null});
 *   var myColor = COLORS.blue;
 *   var isColorValid = !!COLORS[myColor];
 *
 * The last line could not be performed if the values of the generated enum were
 * not equal to their keys.
 *
 *   Input:  {key1: val1, key2: val2}
 *   Output: {key1: key1, key2: key2}
 *
 * @param {object} obj
 * @return {object}
 */
var keyMirror = function(obj) {
  var ret = {};
  var key;
  if (!(obj instanceof Object && !Array.isArray(obj))) {
    throw new Error('keyMirror(...): Argument must be an object.');
  }
  for (key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = key;
  }
  return ret;
};

module.exports = keyMirror;

},{}],"flux-crud-store":[function(require,module,exports){
'use strict';

var Store = require('./crud_store/store');
var Actions = require('./crud_store/actions');
var Constants = require('./crud_store/constants');

module.exports = { Store: Store, Actions: Actions, Constants: Constants };

},{"./crud_store/actions":1,"./crud_store/constants":2,"./crud_store/store":3}]},{},[]);
  return require('flux-crud-store');
}))
