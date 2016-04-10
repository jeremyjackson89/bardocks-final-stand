var GameObj = GameObj || {};

GameObj.Enemy = function(game, x, y, data) {
    Phaser.Sprite.call(this, game, x, y, data.type);

    //some default values
    this.anchor.setTo(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.scale.setTo(-1, 1);
    this.customData = data;
};

GameObj.Enemy.prototype = Object.create(Phaser.Sprite.prototype);
GameObj.Enemy.prototype.constructor = GameObj.Enemy;

GameObj.Enemy.prototype.update = function() {
    this.body.velocity.x = this.customData.speedX;
    //kill if off screen
    if (this.position.x <= 0) {
        this.destroy();
        GameObj.GameState.deadEnemies += 1;
    }
};

GameObj.Enemy.prototype.reset = function(x, y, data) {
    Phaser.Sprite.prototype.reset.call(this, x, y, data.type);
    this.loadTexture(data.type);
    this.customData = data;
};