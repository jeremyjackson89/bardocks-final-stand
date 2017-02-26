var GameObj = GameObj || {};

GameObj.Item = function(game, x, y, data) {
    Phaser.Sprite.call(this, game, x, y, data.type);

    this.anchor.setTo(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.customData = data;
};

GameObj.Item.prototype = Object.create(Phaser.Sprite.prototype);
GameObj.Item.prototype.constructor = GameObj.Item;

GameObj.Item.prototype.update = function() {
    this.body.velocity.x = this.customData.speedX;
    //kill if off screen and not already dead
    if (this.position.x <= 0 && this.alive) {
        this.destroy();
    }
};


GameObj.Item.prototype.reset = function(x, y, data) {
    Phaser.Sprite.prototype.reset.call(this, x, y, data.type);
    this.loadTexture(data.type);
    this.customData = data;
};
