'use strict';

var Grid = new Mongo.Collection('grid');

if (Meteor.isClient) {
  Template.board.helpers({
    grid: function () {
      return Grid.find({});
    }
  });

  Template.row.events({
    'click .ttt-button.player1': function(e) {
      takeMove(e, 1);
    },
    'click .ttt-button.player2': function(e) {
      takeMove(e, 2);
    }
  });

  Template.registerHelper('player', function() {
    if (Router.current().route.getName() == 'player1') {
      return '1';
    } else {
      return '2';
    }
  });
}

Router.route('/', function() {
  this.render('main');
});

Router.route('/player1', function () {
  this.render('play');
});

Router.route('/player2', function () {
  this.render('play');
});

if (Meteor.isServer) {
  Meteor.startup(function () {
    Grid.remove({});
    Grid.insert({vals: ['X', ' ', ' ']});
    Grid.insert({vals: [' ', ' ', ' ']});
    Grid.insert({vals: [' ', ' ', ' ']});
  });
}

/**
 * Gets the current grid of the game
 * @returns {Array} Array of nine characters representing the game board
 */
function getGrid() {
  var t = Grid.find({}).fetch()[0]['vals'];
  t.push.apply(t, Grid.find({}).fetch()[1]['vals']);
  t.push.apply(t, Grid.find({}).fetch()[2]['vals']);
  return t;
}

/**
 * Allows a player to take a move
 * @param {Object} e event passed in by the template
 * @param {number} player the player number
 */
function takeMove(e, player) {

  // Use the event to find the column and row of the clicked element
  var $col = $(e.currentTarget);
  var colNum;
  var rowNum = $(e.currentTarget).parent().data('row');

  if ($col.hasClass('col1')) {
    colNum = 1;
  } else if ($col.hasClass('col2')) {
    colNum = 2;
  } else {
    colNum = 0;
  }

  // Update it in the collection
  var rowId = Grid.find({}).fetch()[rowNum]['_id'];
  var rowVals = Grid.find({}).fetch()[rowNum]['vals'];
  rowVals[colNum] = player == 1 ? 'X' : 'O';
  Grid.update(rowId, {$set: {vals: rowVals}});
}