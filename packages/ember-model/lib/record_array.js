var get = Ember.get,
    set = Ember.set;

var Loader = Ember.Object.extend({
  load: function (array, data) {
    var modelClass = get(array, 'modelClass');
    set(array, 'content', data.map(function (item) {
      return modelClass.findFromCacheOrLoad(item, array.container);
    }));
  },
  reload: function (array) {
    var promises = array.map(function (record) { return record.reload(); });
    return Ember.RSVP.all(promises).then(function () { array.notifyLoaded(); });
  }
});

Ember.RecordArray = Ember.ArrayProxy.extend(Ember.Evented, {
  isLoaded: false,
  isLoading: Ember.computed.not('isLoaded'),
  loader: Loader.create(),

  load: function (klass, data) {
    if (klass) { set(this, 'modelClass', klass); }
    this.loader.load(this, data);
    this.notifyLoaded();
  },

  reload: function() {
    set(this, 'isLoaded', false);
    return this.loader.reload(this);
  },

  notifyLoaded: function() {
    set(this, 'isLoaded', true);
    this.trigger('didLoad');
  }
});

Ember.RecordArray.reopenClass({
  loaders: {
    all: Loader.extend({
      reload: function (array) {
        var modelClass = get(array, 'modelClass');
        return modelClass.adapter.findAll(modelClass, array);
      }
    }),
    query: Loader.extend({
      params: null,
      reload: function (array) {
        var modelClass = get(array, 'modelClass');
        return modelClass.adapter.findQuery(modelClass, array, get(this, 'params'));
      }
    }),
    list: Loader.extend({
      ids: null,
      load: function (array, data) {
        var modelClass = get(array, 'modelClass');
        if (data) { return this._super(array, data); }
        set(array, 'content', get(this, 'ids').map(function (id) {
          return modelClass.cachedRecordForId(id, array.container);
        }));
      }
    })
  }
});
