'use strict';

var CrudStore = require('../lib/index').Store;
var CrudStoreActions = require('../lib/index').Actions;
var Record = require('immutable').Record;

var chai = require('chai');
chai.use(require('dirty-chai'));
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));

describe('crud_store_actions', function () {
  var store;
  var actions;
  var ViewModel;
  var server;

  beforeEach(function () {
    ViewModel = Record({ id: null });
    var MyStore = CrudStore.extend({ viewModel: ViewModel });
    store = new MyStore();
    actions = CrudStoreActions.boundTo(store);

    server = sinon.fakeServer.create();
  });

  afterEach(function () {
    server.restore();
  });

  describe('#create', function () {
    beforeEach(function () {
      actions.create({ id: 77 });
    });

    it('creates a new model with the attributes', function () {
      expect(store.get(77).id).equal(77);
    });

    it('does not make a server call', function () {
      expect(server.requests.length).to.equal(0);
    });
  });

  describe.skip('#createAndSave', function () {
    beforeEach(function () {
      actions.createAndSave({ id: 77 });
    });

    it('creates a new model with the attributes', function () {
      expect(store.get(77).id).equal(77);
    });

    it('issues a server call', function () {
      expect(server.requests.length).to.equal(0);
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

  describe('#fetchAll', function () {
  });
});
