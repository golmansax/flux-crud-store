# Flux CRUD Store

[![Build Status](https://travis-ci.org/golmansax/flux-crud-store.svg?branch=master)](https://travis-ci.org/golmansax/flux-crud-store)
[![Code Climate](https://codeclimate.com/github/golmansax/flux-crud-store/badges/gpa.svg)](https://codeclimate.com/github/golmansax/flux-crud-store)
[![Test Coverage](https://codeclimate.com/github/golmansax/flux-crud-store/badges/coverage.svg)](https://codeclimate.com/github/golmansax/flux-crud-store)

A Flux Store implementation which makes it easy to perform CRUD Actions.
More to come!

## Usage
### Store
```js
var CrudStore = require('flux-crud-store').Store;

// (Optional) subclass of Backbone collection; 'url' has to be defined to be tied to a server
var TurtleCollection = require('backbone').Collection.extend({
  url: '/turtles'
});

// (Required) subclass of Immutable Record; viewModel instances will be passed through the Store API
var TurtleVIewModel = require('immutable').Record({
  id: null,
  name: ''
});

var TurtleStore = CrudStore.extend({
  collection: TurtleCollection,
  viewModel: TurtleViewModel
}).instance();
```

Hook up to React component (assuming Store already has data):
```js
function getStateFromStore(id) {
  return {
    turtle: TurtleStore.get(id)
    
    // Other exposed getter is TurtleStore.getAll()
    // Both methods return instance of Immutable Record subclass, so we can use PureRenderMixin!
  };
}

var MyComponent = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
  },
  
  // We are able to get the benefits of PureRenderMixin!
  // https://facebook.github.io/react/docs/pure-render-mixin.html
  mixins: [React.addons.PureRenderMixin],
  
  componentDidMount: function () {
    TurtleStore.addChangeListener(this._onChange);
  },
  
  componentWillUnmount: function () {
    TurtleStore.removeChangeListener(this._onChange);
  },
  
  _onChange: function () {
    this.setState(getStateFromStore(this.props.id);
  },
  
  componentWillReceiveProps: function (newProps) {
    this.setState(getStateFromStore(newProps.id));
  },
  
  render: function () {
    return <div>this.state.turtle.name</div>;
  }
});
```
See [react-bind-mixin](https://github.com/golmansax/react-bind-mixin) for a Mixin that binds a Store to a React Component to skip the setup!

## Installation
### Node
```bash
npm install flux-crud-store --save
```
```js
var CrudStore = require('flux-crud-store').Store;
var CrudActions = require('flux-crud-store').Actions;
```
### Bower
```bash
bower install flux-crud-store
```
```js
// Assuming dist/flux_crud_store.js has been included without CommonJS or RequireJS
var CrudStore = FluxCrudStore.Store;
var CrudActions = FluxCrudStore.Actions;
```
