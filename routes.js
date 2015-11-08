Router.route('/', function() {
  this.render('game');
});

Router.route('/player1', function () {
  this.render('play');
});

Router.route('/player2', function () {
  this.render('play');
});