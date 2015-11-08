'use strict';

var Grid = new Mongo.Collection('grid');
var Meta = new Mongo.Collection('meta');

if (Meteor.isClient) {
  Template.board.helpers({
    'grid': function() {
      return Grid.find({});
    }
  });

  Template.board.events({
    'click .reset': function(e) {
      // Subtract the winner from three to get the id of the other player
      var curStart = 3 - Meta.find({}).fetch()[0]['victor'];
      console.log(curStart);
      clearGrid();
      var docId = Meta.find({}).fetch()[0]['_id'];
      Meta.update(docId, {$set: {turn: curStart, victor: curStart, resigned: false}});
    },
    'click .resign': function(e) {
      var docId = Meta.find({}).fetch()[0]['_id'];
      var curWin = Router.current().route.getName() == 'player1' ? '2' : '1';
      Meta.update(docId, {$set: {turn: 0, victor: curWin, resigned: true}});
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
    return Router.current().route.getName() == 'player1' ? '1' : '2';
  });

  Template.registerHelper('equal', function (a, b) {
    return a == b;
  });

  Template.registerHelper('turn', function() {
    if (Meta.find({}).fetch().length === 0) {
      return 0;
    } else {
      return Meta.find({}).fetch()[0]['turn'];
    }
  });

  Template.registerHelper('victor', function() {
    if (Meta.find({}).fetch().length === 0) {
      return 0;
    } else {
      return Meta.find({}).fetch()[0]['victor'];
    }
  });

  Template.registerHelper('resigned', function() {
    if (Meta.find({}).fetch().length === 0) {
      return 0;
    } else {
      return Meta.find({}).fetch()[0]['resigned'];
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
    Meta.insert({turn: 1, victor: 2, resigned: false});
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

function win(player) {
  var docId = Meta.find({}).fetch()[0]['_id'];
  Meta.update(docId, {$set: {turn: 0}});
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

  // If there is already something in the spot, we just ignore this click
  if (getGrid()[3*rowNum+colNum] != ' ') {
    return;
  }

  var pChar = player == 1 ? 'X' : 'O';

  // Update it in the collection
  updateGrid(rowNum, colNum, pChar);

  // Check if the current player won, first check the row and column and then both diagonals
  var curGrid = getGrid();
  if (curGrid[3*rowNum] == pChar && curGrid[3*rowNum+1] == pChar && curGrid[3*rowNum+2] == pChar) {
    win(player);
  } else if (curGrid[colNum] == pChar && curGrid[3+colNum] == pChar && curGrid[6+colNum] == pChar) {
    win(player);
  } else if (curGrid[0] == pChar && curGrid[4] == pChar && curGrid[8] == pChar) {
    win(player);
  } else if (curGrid[2] == pChar && curGrid[4] == pChar && curGrid[6] == pChar) {
    win(player);
  } else {
    var meta = Meta.find({}).fetch()[0];
    var nextTurn = meta['turn'] == 1 ? 2 : 1;
    var docId = meta['_id'];
    Meta.update(docId, {$set: {turn: nextTurn}});
  }
}