'use strict';

var CrudStore = require('../lib/index').Store;
var CrudStoreActions = require('../lib/index').Actions;

var chai = require('chai');
chai.use(require('dirty-chai'));
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));

describe('crud_store', function () {
  var store;
  var actions;

  beforeEach(function () {
    store = new CrudStore();
    actions = CrudStoreActions.bindTo(store);
  });

  describe('#addChangeListener', function () {
    it('binds a callback to when the store changes', function () {
      var spy = sinon.spy();
      store.addChangeListener(spy);
      actions.create();
      expect(spy).to.have.been.called();
    });
  });

  describe('#removeChangeListener', function () {
    it('removes an already bound callback', function () {
      var spy = sinon.spy();
      store.addChangeListener(spy);
      store.removeChangeListener(spy);
      actions.create();
      expect(spy).not.to.have.been.called();
    });

    it('throws an error if the callback is not already bound', function () {
      expect(function () {
        store.removeChangeListener(function () { });
      }).to.throw();
    });
  });

  describe('#get', function () {
    it('returns null if requested id is not in storage', function () {
    });

    it('returns an instance of the specified view model', function () {
    });

    it('returns the same view model instance if nothing changed', function () {
    });
  });

  describe('#getAll', function () {
    it('returns an empty Iterable if nothing is in storage', function () {
    });

    it('returns an Iterable of the specified view model', function () {
    });

    it('returns the same Iterable instance if nothing changed', function () {
    });
  });
});
