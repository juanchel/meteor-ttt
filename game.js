'use strict';

var Grid = new Mongo.Collection('grid');
var Meta = new Mongo.Collection('meta');

if (Meteor.isClient) {
  Template.board.helpers({
    'grid': function() {
      return Grid.find({});
    }
  });

  Template.row.helpers({
    'turn': function() {
      return Meta.find({}).fetch()[0]['turn'];
    }
  });

  Template.board.events({
    'click .reset': function(e) {
      clearGrid();
    },
    'click .resign': function(e) {
      clearGrid();
    }
  })

  Template.row.events({
    'click .ttt-button.player1': function(e) {
      if (Meta.find({}).fetch()[0]['turn'] == 1) {
        takeMove(e, 1);
      }
    },
    'click .ttt-button.player2': function(e) {
      if (Meta.find({}).fetch()[0]['turn'] == 2) {
        takeMove(e, 2);
      }
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

if (Meteor.isServer) {
  Meteor.startup(function () {
    // ' ' grid has nothing in it
    // 'X' grid has an x in it
    // 'O' grid has an o in it
    Grid.remove({});
    Grid.insert({vals: [' ', ' ', ' ']});
    Grid.insert({vals: [' ', ' ', ' ']});
    Grid.insert({vals: [' ', ' ', ' ']});

    Meta.remove({});
    Meta.insert({turn: 1});
  });
}


/**
 * Updates the game grid.
 * @param {number} row - The row of the grid to be updated.
 * @param {number} col - The column of the grid to be updated.
 * @param {number} val - The new value of the grid.
 */
function updateGrid(row, col, val) {
  var rowId = Grid.find({}).fetch()[row]['_id'];
  var rowVals = Grid.find({}).fetch()[row]['vals'];
  rowVals[col] = val;
  Grid.update(rowId, {$set: {vals: rowVals}});
}

/**
 * Gets the current grid of the game.
 * @returns {Array} Array of nine characters representing the game board.
 */
function getGrid() {
  var t = Grid.find({}).fetch()[0]['vals'];
  t.push.apply(t, Grid.find({}).fetch()[1]['vals']);
  t.push.apply(t, Grid.find({}).fetch()[2]['vals']);
  return t;
}

/**
 * Clears and resets the game grid
 */
function clearGrid() {
  var id0 = Grid.find({}).fetch()[0]['_id'];
  var id1 = Grid.find({}).fetch()[1]['_id'];
  var id2 = Grid.find({}).fetch()[2]['_id'];
  Grid.update(id0, {$set: {vals: [' ', ' ', ' ']}});
  Grid.update(id1, {$set: {vals: [' ', ' ', ' ']}});
  Grid.update(id2, {$set: {vals: [' ', ' ', ' ']}});
}

/**
 * Allows a player to take a move
 * @param {Object} e - Event passed in by the template
 * @param {number} player - The player number
 */
function takeMove(e, player) {
  // Use the event to find the column and row of the clicked element
  var $col = $(e.currentTarget);
  var rowNum = $(e.currentTarget).parent().data('row');
  var colNum;
  if ($col.hasClass('col1')) {
    colNum = 1;
  } else if ($col.hasClass('col2')) {
    colNum = 2;
  } else {
    colNum = 0;
  }

  var pChar = player == 1 ? 'X' : 'O';

  // Update it in the collection
  updateGrid(rowNum, colNum, pChar);

  // Check if the current player won, first check the row and column and then both diagonals
  var curGrid = getGrid();
  if (curGrid[3*rowNum] == pChar && curGrid[3*rowNum+1] == pChar && curGrid[3*rowNum+2] == pChar) {
    clearGrid();
  } else if (curGrid[colNum] == pChar && curGrid[3+colNum] == pChar && curGrid[6+colNum] == pChar) {
    clearGrid();
  } else if (curGrid[0] == pChar && curGrid[4] == pChar && curGrid[8] == pChar) {
    clearGrid();
  } else if (curGrid[2] == pChar && curGrid[4] == pChar && curGrid[6] == pChar) {
    clearGrid();
  } else {
    var meta = Meta.find({}).fetch()[0];
    var nextTurn = meta['turn'] == 1 ? 2 : 1;
    var docId = meta['_id'];
    Meta.update(docId, {$set: {turn: nextTurn}});
  }
}