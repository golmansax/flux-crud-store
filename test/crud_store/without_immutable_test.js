'use strict';

var mockery = require('mockery');

var chai = require('chai');
chai.use(require('dirty-chai'));
var expect = chai.expect;

describe('crud_store/without_immutable', function () {
  var store;
  var actions;
  var CrudStore;
  var CrudStoreActions;

  before(function () {
    mockery.enable({ useCleanCache: true });

    mockery.registerAllowable('../../lib/crud_store');
    mockery.registerAllowable('../../lib/crud_store_actions');
    mockery.registerAllowable('backbone');
    mockery.registerAllowable('underscore');
    mockery.registerAllowable('jquery');
    mockery.registerMock('immutable', undefined);
  });

  after(function () {
    mockery.disable();
  });

  beforeEach(function () {
    CrudStore = require('../../lib/crud_store');
    CrudStoreActions = require('../../lib/crud_store_actions');

    store = CrudStore.instance();
    actions = CrudStoreActions.boundTo(store);
  });

  describe('#initialize', function () {
    it('throws an error if you try to use viewModel', function () {
      expect(function () {
        CrudStore.extend({ viewModel: 'blah' }).instance();
      }).to.throw('You need to install Immutable.js to set viewModel');
    });
  });

  describe('#get', function () {
    it('returns a plain object if not using view model', function () {
      store = CrudStore.instance();
      actions = CrudStoreActions.boundTo(store);
      actions.create({ id: 77 });
      expect(store.get(77)).to.deep.equal({ id: 77 });
    });
  });

  describe('#getAll', function () {
    it('returns a plain array', function () {
      actions.create({ id: 77 });
      expect(store.getAll()).to.deep.equal([{ id: 77 }]);
    });
  });
});
