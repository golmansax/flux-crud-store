'use strict';

var CrudStore = require('../lib/index').Store;
var CrudStoreActions = require('../lib/index').Actions;
var Record = require('immutable').Record;
var Collection = require('backbone').Collection;

var chai = require('chai');
chai.use(require('dirty-chai'));
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));

var Backbone = require('backbone');

describe('crud_store_actions', function () {
  var store;
  var actions;
  var ViewModel;
  var ModelCollection;

  beforeEach(function () {
    ViewModel = Record({ id: null });
    ModelCollection = Collection.extend({ url: '/models' });
    store = CrudStore.extend({
      viewModel: ViewModel,
      collection: ModelCollection
    }).instance();
    actions = CrudStoreActions.boundTo(store);

    Backbone.ajax = sinon.stub();
  });

  describe('#create', function () {
    beforeEach(function () {
      actions.create({ id: 77 });
    });

    it('creates a new model with the attributes', function () {
      expect(store.get(77).id).equal(77);
    });

    it('does not make a server call', function () {
      expect(Backbone.ajax).not.to.have.been.called();
    });
  });

  describe('#createAndSave', function () {
    beforeEach(function () {
      actions.createAndSave({});
    });

    it('issues a server call', function () {
      expect(Backbone.ajax).to.have.been.called();
      expect(Backbone.ajax.getCall(0).args[0].url).to.equal('/models');
    });
  });

  describe('#update', function () {
  });

  describe('#updateAndSave', function () {
  });

  describe('#destroy', function () {
  });

  describe('#destroyAndSave', function () {
  });

  describe('#save', function () {
  });

  describe('#load', function () {
  });

  describe('#fetch', function () {
    beforeEach(function () {
      actions.fetch(8);
    });

    it('throws an error if a collection does not have url', function () {
      store = CrudStore.extend({ viewModel: ViewModel }).instance();
      actions = CrudStoreActions.boundTo(store);
      expect(function () {
        actions.fetch(8);
      }).to.throw('fetch action requires \'url\' to be set');
    });

    it('makes get return a loading response', function () {
      expect(store.get(8).isLoading).be.true();
    });

    it('issues a server call', function () {
      expect(Backbone.ajax).to.have.been.called();
      expect(Backbone.ajax.getCall(0).args[0].url).to.equal('/models/8');
    });

    it('makes get return the view model on success', function () {
      Backbone.ajax.getCall(0).args[0].success({ id: 8 });
      expect(store.get(8).id).to.equal(8);
    });
  });

  describe('#fetchAll', function () {
    it('throws an error if a collection does not have url', function () {
      store = CrudStore.extend({ viewModel: ViewModel }).instance();
      actions = CrudStoreActions.boundTo(store);
      expect(function () {
        actions.fetchAll();
      }).to.throw('fetchAll action requires \'url\' to be set');
    });
  });
});
