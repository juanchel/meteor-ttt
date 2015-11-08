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
      if (curStart == 3) {
        curStart = Math.random() > 0.5 ? 1 : 2;
      }
      console.log(curStart);
      clearGrid();
      var docId = Meta.find({}).fetch()[0]['_id'];
      Meta.update(docId, {$set: {turn: curStart, victor: curStart, resigned: false}});
    },
    'click .resign': function(e) {
      var docId = Meta.find({}).fetch()[0]['_id'];
      var curWin = Router.current().route.getName() == 'player1' ? '2' : '1';
      var winsArr = Meta.find({}).fetch()[0]['wins'];
      winsArr[curWin - 1] += 1;
      Meta.update(docId, {$set: {turn: 0, victor: curWin, resigned: true, wins: winsArr}});
    }
  });

  Template.board.helpers({
    'winsone': function() {
      return metaQuery('wins')[0];
    },
    'winstwo': function() {
      return metaQuery('wins')[1];
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
    return metaQuery('turn');
  });

  Template.registerHelper('victor', function() {
    return metaQuery('victor');
    if (Meta.find({}).fetch().length === 0) {
      return 0;
    } else {
      return Meta.find({}).fetch()[0]['victor'];
    }
  });

  Template.registerHelper('resigned', function() {
    return metaQuery('resigned');
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
    Meta.insert({turn: 1, victor: 2, resigned: false, wins: [0, 0]});
  });
}


/**
 * Returns the value of the key in the main element in the meta db.
 * @param {string} qkey - The key to query on.
 * @returns {*} The result of the query, or 0 if the db is not populated.
 */
function metaQuery(qkey) {
  if (Meta.find({}).fetch().length === 0) {
    return 0;
  } else {
    return Meta.find({}).fetch()[0][qkey];
  }
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

function win(player, a, b, c) {
  var winsArr = Meta.find({}).fetch()[0]['wins'];
  winsArr[player - 1] += 1;
  var docId = Meta.find({}).fetch()[0]['_id'];
  Meta.update(docId, {$set: {turn: 0, victor: player, wins: winsArr}});
  console.log([a, b, c]);
  var pChar = player == 1 ? 'Xw' : 'Ow';
  updateGrid(a[0], a[1], pChar);
  updateGrid(b[0], b[1], pChar);
  updateGrid(c[0], c[1], pChar);
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
  var done = true;
  for (var i in curGrid) {
    done = curGrid[i] == ' ' ? false : done;
  }
  if (done) {
    var docId = Meta.find({}).fetch()[0]['_id'];
    Meta.update(docId, {$set: {turn: 0, victor: 0}});
  } else if (curGrid[3*rowNum] == pChar && curGrid[3*rowNum+1] == pChar && curGrid[3*rowNum+2] == pChar) {
    win(player, [rowNum, 0], [rowNum, 1], [rowNum, 2]);
  } else if (curGrid[colNum] == pChar && curGrid[3+colNum] == pChar && curGrid[6+colNum] == pChar) {
    win(player, [0, colNum], [1, colNum], [2, colNum]);
  } else if (curGrid[0] == pChar && curGrid[4] == pChar && curGrid[8] == pChar) {
    win(player, [0, 0], [1, 1], [2, 2]);
  } else if (curGrid[2] == pChar && curGrid[4] == pChar && curGrid[6] == pChar) {
    win(player, [0, 2], [1, 1], [2, 0]);
  } else {
    var meta = Meta.find({}).fetch()[0];
    var nextTurn = meta['turn'] == 1 ? 2 : 1;
    var docId = meta['_id'];
    Meta.update(docId, {$set: {turn: nextTurn}});
  }
}