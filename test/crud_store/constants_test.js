'use strict';

var Constants = require('../../lib/index').Constants;

var chai = require('chai');
chai.use(require('dirty-chai'));
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));

describe('crud_store/with_immutable', function () {
  var constants;

  beforeEach(function () {
    constants = Constants.instance('todo');
  });

  describe('#instance', function () {
    it('creates a hash with all of the actions as keys', function () {
      expect(constants).to.include.keys([
        'TODO_UPDATE',
        'TODO_DESTROY',
        'TODO_CREATE'
      ]);
    });

    it('does not include extra keys', function () {
      expect(Object.keys(constants).length).to.equal(3);
    });

    it('creates a hash where all of the keys equal the values', function () {
      Object.keys(constants).forEach(function (key) {
        expect(constants[key]).to.equal(key);
      });
    });
  });
});
