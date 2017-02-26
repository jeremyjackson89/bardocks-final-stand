var GameObj = GameObj || {};

GameObj.EnergyBlast = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'energyBlast');

    //some default values
    this.anchor.setTo(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.setBlastScale();
};

GameObj.EnergyBlast.prototype = Object.create(Phaser.Sprite.prototype);
GameObj.EnergyBlast.prototype.constructor = GameObj.EnergyBlast;

GameObj.EnergyBlast.prototype.reset = function(x, y) {
    Phaser.Sprite.prototype.reset.call(this, x, y);
    this.setBlastScale();
};

GameObj.EnergyBlast.prototype.setBlastScale = function() {
	this.scale.setTo(1);
    if (GameObj.GameState.largeBlastsEnabled) {
        this.scale.setTo(1.5);
    }
}
