function NIL() {}

Ember.Model.Store = Ember.Object.extend({
  modelFor: function(type) {
    return Ember.getOwner(this).resolveRegistration('model:'+type);
  },

  adapterFor: function(type) {
    var adapter = this.modelFor(type).adapter,
        owner = Ember.getOwner(this);

    if (adapter && adapter !== Ember.Model.adapter) {
      return adapter;
    } else {
      return owner.lookup('adapter:'+ type) ||
             owner.lookup('adapter:application') ||
             owner.lookup('adapter:REST');
    }
  },

  createRecord: function(type, props) {
    var klass = this.modelFor(type);
    klass.reopenClass({adapter: this.adapterFor(type)});
    return klass.create(Ember.getOwner(this).ownerInjection(), props);
  },

  find: function(type, id) {
    if (arguments.length === 1) { id = NIL; }
    return this._find(type, id, true);
  },

  _find: function(type, id, async) {
    var klass = this.modelFor(type);

    // if (!klass.adapter) {
      klass.reopenClass({adapter: this.adapterFor(type)});
    // }

    if (id === NIL) {
      return klass._findFetchAll(async, Ember.getOwner(this));
    } else if (Ember.isArray(id)) {
      return klass._findFetchMany(id, async, Ember.getOwner(this));
    } else if (typeof id === 'object') {
      return klass._findFetchQuery(id, async, Ember.getOwner(this));
    } else {
      return klass._findFetchById(id, async, Ember.getOwner(this));
    }
  },

  _findSync: function(type, id) {
    return this._find(type, id, false);
  }
});

Ember.onLoad('Ember.Application', function(Application) {

  Application.initializer({
    name: "store",

    initialize: function(application) {
      var store = application.Store || Ember.Model.Store;
      application.register('store:application', store);
      application.register('store:main', store);

      application.inject('route', 'store', 'store:main');
      application.inject('controller', 'store', 'store:main');
    }
  });

});
