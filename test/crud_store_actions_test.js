'use strict';

require('node-jsx').install({ extension: '.jsx' });
require('./mock_dom');

var chai = require('chai');
chai.use(require('dirty-chai'));
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));

var React = require('react');
var TestUtils = require('react/addons').addons.TestUtils;
var Component = require('./mock_component');
var StoreOne = require('./mock_store_one');

describe('bind_mixin', function () {
  var component;

  beforeEach(function () {
    component = React.createElement(Component);
  });

  it('sets initial state', function () {
    var instance = TestUtils.renderIntoDocument(component);
    expect(instance.getDOMNode().textContent).to.equal('first,second');
  });

  it('updates state when store changes', function () {
    var instance = TestUtils.renderIntoDocument(component);
    StoreOne.setValue('changed');
    expect(instance.getDOMNode().textContent).to.equal('changed,second');
  });

  it('only calls the bound function when the store changes', function () {
    var instance = TestUtils.renderIntoDocument(component);
    sinon.spy(instance, 'getStateFromStoreTwo');
    StoreOne.setValue('changed');
    expect(instance.getStateFromStoreTwo).not.to.have.been.called();
  });

  it('removes listener when component is unmounted', function () {
    var div = document.createElement('div');
    var instance = React.render(component, div);

    sinon.spy(instance, 'getStateFromStoreOne');
    StoreOne.setValue('changed');
    expect(instance.getStateFromStoreOne).to.have.been.called();
    instance.getStateFromStoreOne.reset();

    React.unmountComponentAtNode(div);
    StoreOne.setValue('changed again');
    expect(instance.getStateFromStoreOne).not.to.have.been.called();
  });
});
