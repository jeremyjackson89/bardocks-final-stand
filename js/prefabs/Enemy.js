var GameObj = GameObj || {};

GameObj.Enemy = function(game, x, y, data) {
  Phaser.Sprite.call(this, game, x, y, data.enemy);
  
  //some default values
  this.anchor.setTo(0.5);
  this.checkWorldBounds = true;
  this.outOfBoundsKill = true;

};

GameObj.Enemy.prototype = Object.create(Phaser.Sprite.prototype);
GameObj.Enemy.prototype.constructor = GameObj.Enemy;