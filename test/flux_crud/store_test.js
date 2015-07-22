'use strict';

var Store = require('../../lib/index').Store;

var chai = require('chai');
chai.use(require('dirty-chai'));
var expect = chai.expect;

describe('flux_crud/store', function () {
  var store;

  beforeEach(function () {
    store = new Store();
  });

});
