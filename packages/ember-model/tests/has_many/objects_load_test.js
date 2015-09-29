var attr = Ember.attr;

module("Ember.HasManyArray - objects loading");

test("loads objects based on their ids", function() {
  expect(6);

  var json = {
    id: 1,
    title: 'foo',
    comments: [1, 2, 3]
  };

  var Comment = Ember.Model.extend({
    id: attr(),
    text: attr()
  });

  var Article = Ember.Model.extend({
    title: attr(),

    comments: Ember.hasMany(Comment, { key: 'comments' })
  });

  Comment.adapter = Ember.FixtureAdapter.create();
  Comment.FIXTURES = [
    {id: 1, text: 'uno'},
    {id: 2, text: 'dos'},
    {id: 3, text: 'tres'}
  ];

  var article = Article.create();
  var comments = article.get('comments');

  equal(comments.get('length'), 0);

  Ember.run(article, article.load, json.id, json);

  stop();
  var commentPromises = comments.toArray().map(function(c) { return Ember.loadPromise(c); });
  var promise = Ember.RSVP.all(commentPromises);
  promise.then(function() {
    start();
    equal(comments.get('length'), 3, "There are 3 comments");
    ok(Ember.run(comments, comments.get, 'firstObject') instanceof Comment, "The first object is a Comment object");
    deepEqual(Ember.run(comments, comments.mapBy, 'text'), ['uno', 'dos', 'tres'], "The comments are loaded");
    ok(!comments.isEvery('isNew'), "Records should not be new");
    ok(comments.get('isLoaded'), "Sets isLoaded to true");
  });
});
