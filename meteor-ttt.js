Grid = new Mongo.Collection('grid');

if (Meteor.isClient) {
  Template.board.helpers({
    grid: function () {
      return Grid.find({});
    }
  });

  Template.row.events({
    'click .ttt-button': function(e) {
      alert('ayy');
    }
  });
}

Router.route('/', function() {
  this.render('main');
});

Router.route('/player1', function () {
  this.render('one', {
    data: {
      player: '1'
    }
  });
});

Router.route('/player2', function () {
  this.render('two', {
    data: {
      player: '2'
    }
  });
});

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}