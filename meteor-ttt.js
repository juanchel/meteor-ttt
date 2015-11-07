Grid = new Mongo.Collection("grid");

if (Meteor.isClient) {
  Template.board.helpers({
    grid: function () {
      return Grid.find({});
    }
  });
}

Router.route('/', function() {
  this.render('main');
});

Router.route('/player1');

Router.route('/player2');

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
