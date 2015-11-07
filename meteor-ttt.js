Grid = new Mongo.Collection("grid");

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });

  Template.body.helpers({
    grid: function () {
      return Grid.find({});
    },
    rows: [
      {vals: ["0", "3", "0"]},
      {vals: ["0", "0", "0"]},
      {vals: ["0", "1", "0"]}
    ]
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
