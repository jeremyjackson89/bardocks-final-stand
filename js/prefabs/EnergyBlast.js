var GameObj = GameObj || {};

GameObj.EnergyBlast = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'energyBlast');
  
  //some default values
  this.anchor.setTo(0.5);
  this.checkWorldBounds = true;
  this.outOfBoundsKill = true;
};

GameObj.EnergyBlast.prototype = Object.create(Phaser.Sprite.prototype);
GameObj.EnergyBlast.prototype.constructor = GameObj.EnergyBlast;