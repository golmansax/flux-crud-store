# Flux CRUD Store

[![Build Status](https://travis-ci.org/golmansax/flux-crud-store.svg?branch=master)](https://travis-ci.org/golmansax/flux-crud-store)
[![Code Climate](https://codeclimate.com/github/golmansax/flux-crud-store/badges/gpa.svg)](https://codeclimate.com/github/golmansax/flux-crud-store)
[![Test Coverage](https://codeclimate.com/github/golmansax/flux-crud-store/badges/coverage.svg)](https://codeclimate.com/github/golmansax/flux-crud-store)

A Flux Store implementation which makes it easy to perform CRUD Actions by hooking into Backbone.  It also takes advantage of Immutable.js so that you can use `PureRenderMixin` in all of your components to boost performance!  An article by Facebook on using [Immutable.js with Flux](https://facebook.github.io/react/docs/advanced-performance.html#immutable-js-and-flux).

## Full Example
See https://github.com/golmansax/todo-app-in-rails-flux for an app that uses all of the features of this library.  It is a Rails app, so all of the JS lies within `app/assets/javascripts` directory.  The code might be a little confusing though =p.

## Usage
### Store
```js
var CrudStore = require('flux-crud-store').Store;

// (Optional) subclass of Backbone collection; 'url' has to be defined to be tied to a server
var TurtleCollection = require('backbone').Collection.extend({
  url: '/turtles'
});

// (optional) subclass of Immutable.Record; viewModel instances will be passed through the Store API
var TurtleViewModel = require('immutable').Record({
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
    // following returns:
    //  - instance of TurtleViewModel if viewModel is set
    //  - a plain JS object otherwise
    turtle: TurtleStore.get(id)

    // Other exposed getter is TurtleStore.getAll(), this returns:
    //  - an Immutable.OrderedMap if viewModel is set, with:
    //    - a plain JS object otherwise
    //    - keys of Backbone cids
    //    - values of TurtleViewModel instances
    //  - a plain JS array otherwise
    // See http://facebook.github.io/immutable-js/ for more on immutable

    // turtles: TurtleStore.getAll()
  };
}

var MyComponent = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
  },

  // We are able to get the benefits of PureRenderMixin because we are using Immutable objects!
  // https://facebook.github.io/react/docs/pure-render-mixin.html
  mixins: [React.addons.PureRenderMixin],

  componentDidMount: function () {
    TurtleStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function () {
    TurtleStore.removeChangeListener(this._onChange);
  },

  _onChange: function () {
    this.setState(getStateFromStore(this.props.id));
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

### Actions
```js
var CrudActions = require('flux-crud-store').Actions;

// Assuming TurtleStore defined in previous section
var TurtleActions = CrudActions.boundTo(TurtleStore);
```

Following are actions that **do not make** server requests. (They only make changes to the Store.)
```js
var id = 'some-arbitrary-id';
var data = ({ name: 'Leonardo' });

TurtleActions.create(data);

TurtleActions.update(id, data);

TurtleActions.destroy(id);
```

Following are actions that **make** server requests!  (They make changes to the Store and then make an appropriate server request.) They require `url` to be set on the Backbone Collection passed into `CrudStore.extend` (see previous section).
```js
// Following examples assume that 'url' set on Backbone Collection passed to CrudStore
// is '/turtles' (can see previous section for how this is hooked up)
var id = 'some-arbitrary-id';
var data = ({ name: 'Leonardo' });

TurtleActions.createAndSave(data);
// POSTs to '/turtles'

TurtleActions.updateAndSave(id, data);
// PUTs to '/turtles/id'

TurtleActions.destroyAndSave(id);
// DELETEs to '/turtles/id'

// Following saves all unsaved changes for a specific model
TurtleActions.save(id);
// PUTs to '/turtles/id'
```

Following are actions that also make server requests, and affect the getters defined in the Store.
```js
// assuming nothing is in the store
console.log(TurtleStore.getAll()); // returns an empty Immutable.OrderedMap

TurtleStore.fetchAll(); // GETs to '/turtles'

// BEFORE the server request returns
console.log(TurtleStore.getAll()); // returns { isLoading: true };
console.log(TurtleStore.get('any-id')); // returns { isLoading: true };

// AFTER server request returns
console.log(TurtleStore.getAll()); // returns Immutable.OrderedMap as described above
console.log(TurtleStore.get('any-id')); // returns instance of TurtleViewModel or null


TurtleStore.fetch('any-id');

// BEFORE the server request returns
console.log(TurtleStore.get('any-id')); // returns { isLoading: true };
console.log(TurtleStore.get('another-id')); // not affected

// AFTER server request returns
console.log(TurtleStore.get('any-id')); // returns instance of TurtleViewModel or null
```

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
