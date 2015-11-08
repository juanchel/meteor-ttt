This my deliverable for challenge 1: a website that allows two people to play tic tac toe implemented in meteor.

#### How to play it

##### Setup
If you download this repo, you should just be able to run it from within its directory with `meteor`. This project uses [iron-router](https://github.com/iron-meteor/iron-router) in addition to the default meteor stack.

##### Navigation
There are three "pages" in the app, a landing page at '/', and one for each player, at '/player1' and '/player2'. To play the game, you can navigate to one of the player's pages from the main page or go straight to one of the player's pages.

##### Rules
The rules of tic tac toe behave normally. The player that loses gets to go first for the next game, a player is chosen at random if there is a tie. During a game, either player may resign at any time by pressing the resign button. After a game is over, either player may hit the reset button to start a new game.

#### Implementation

In a nutshell, whenever a player clicks on a square, an event is triggered in Meteor and it updates the MongoDB documents that hold the state of the game. The changes from Mongo cascade into a bunch of Meteor helper functions that affect the html and the classes of many of the elements. This changes to the classes affect the css which is what is mainly used to draw the game board.

##### Things to improve
Keeping everything in the css works fine, but ideally I would have liked to keep more information in the html5 data attributes, but things didn't seem to update correctly because of async issues. I think I could have somehow used `Meteor.defer` to solve this but I didn't know about its existence until the project was almost done.

I also think that I could've setup my MongoDB schema a better weird for the game state. I was initially going off of the tutorial on Meteor's site and wasn't aware of what I could really do with MongoDB.

This was my first foray into Meteor, so I'm still a beginner and there might be more things that aren't done in "the Meteor way" that I'm not even aware of.
