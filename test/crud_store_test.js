'use strict';

var CrudStore = require('../lib/index').Store;
var CrudStoreActions = require('../lib/index').Actions;
var Record = require('immutable').Record;
var Iterable = require('immutable').Iterable;

var chai = require('chai');
chai.use(require('dirty-chai'));
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));

describe('crud_store', function () {
  var store;
  var actions;
  var ViewModel;

  beforeEach(function () {
    ViewModel = Record({ id: null });
    store = CrudStore.extend({ viewModel: ViewModel }).instance();
    actions = CrudStoreActions.boundTo(store);
  });

  describe('#initialize', function () {
    it('throws an error if viewModel is set and not a function', function () {
      expect(function () {
        store = CrudStore.extend({ viewModel: 'blah' }).instance();
      }).to.throw('viewModel, if defined, must be an Immutable.Record class');
    });

    it('throws an error if viewModel is a class but not a Record', function () {
      expect(function () {
        store = CrudStore.extend({ viewModel: function () {} }).instance();
      }).to.throw('viewModel, if defined, must be an Immutable.Record class');
    });

    it('throws an error if collection is not set', function () {
      expect(function () {
        store = CrudStore.extend({
          viewModel: ViewModel,
          collection: null
        }).instance();
      }).to.throw('collection must be set');
    });
  });

  describe('#addChangeListener', function () {
    it('can bind multiple callbacks to when the store changes', function () {
      var spy1 = sinon.spy();
      var spy2 = sinon.spy();
      store.addChangeListener(spy1);
      store.addChangeListener(spy2);
      actions.create();
      expect(spy1).to.have.been.called();
      expect(spy2).to.have.been.called();
    });

    it('throws an error if the param is not a function', function () {
      expect(function () {
        store.addChangeListener();
      }).to.throw('is not a function');
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

    it('throws an error if the param is not a function', function () {
      expect(function () {
        store.removeChangeListener();
      }).to.throw('is not a function');
    });

    it('throws an error if the callback is not already bound');
  });

  describe('#get', function () {
    it('returns null if requested id is not in storage', function () {
      expect(store.get(77)).to.be.null();
    });

    it('returns an instance of the specified view model', function () {
      actions.create({ id: 77 });
      expect(store.get(77)).to.be.instanceOf(ViewModel);
    });

    it('returns the same view model instance if nothing changed', function () {
      actions.create({ id: 77 });
      expect(store.get(77)).to.equal(store.get(77));
    });

    it('returns a plain object if not using view model', function () {
      store = CrudStore.instance();
      actions = CrudStoreActions.boundTo(store);
      actions.create({ id: 77 });
      expect(store.get(77)).to.deep.equal({ id: 77 });
    });
  });

  describe('#getAll', function () {
    it('returns an empty Iterable if nothing is in storage', function () {
      expect(store.getAll().size).to.equal(0);
    });

    it('returns an Iterable of the specified view model', function () {
      actions.create({ id: 77 });
      var viewModels = store.getAll();

      expect(viewModels).to.be.instanceOf(Iterable);
      expect(viewModels.size).to.equal(1);

      store.getAll().forEach(function (viewModel) {
        expect(viewModel).to.be.instanceOf(ViewModel);
      });
    });

    it('returns the same Iterable instance if nothing changed', function () {
      actions.create({ id: 77 });
      expect(store.getAll()).to.equal(store.getAll());
    });

    it('works even when models are destroyed', function () {
      actions.create({ id: 77 });
      expect(store.getAll().size).to.equal(1);
      actions.destroy({ id: 77 });
      expect(store.getAll().size).to.equal(0);
    });

    it('returns a plain array if not using view model', function () {
      store = CrudStore.instance();
      actions = CrudStoreActions.boundTo(store);
      actions.create({ id: 77 });
      expect(store.getAll()).to.deep.equal([{ id: 77 }]);
    });
  });
});
