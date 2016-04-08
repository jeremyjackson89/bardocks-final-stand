var GameObj = GameObj || {};

GameObj.Enemy = function(game, x, y, data) {
    Phaser.Sprite.call(this, game, x, y, data.type);

    //some default values
    this.anchor.setTo(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.scale.setTo(-1, 1);
    this.data = data;
};

GameObj.Enemy.prototype = Object.create(Phaser.Sprite.prototype);
GameObj.Enemy.prototype.constructor = GameObj.Enemy;

GameObj.Enemy.prototype.update = function() {
	this.body.velocity.x = this.data.speedX;
    //kill if off world in the bottom
    if (this.position.x < 1) {
        this.kill();
    }
};
