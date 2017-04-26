var GameObj = GameObj || {};

GameObj.EnemyEnergyBlast = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'energyBlast');

    //some default values
    this.anchor.setTo(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.scale.setTo(-1, 1);
};

GameObj.EnemyEnergyBlast.prototype = Object.create(Phaser.Sprite.prototype);
GameObj.EnemyEnergyBlast.prototype.constructor = GameObj.EnemyEnergyBlast;

GameObj.EnemyEnergyBlast.prototype.reset = function(x, y) {
    Phaser.Sprite.prototype.reset.call(this, x, y);
};