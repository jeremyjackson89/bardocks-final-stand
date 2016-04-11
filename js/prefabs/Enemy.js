var GameObj = GameObj || {};

GameObj.Enemy = function(game, x, y, data) {
    Phaser.Sprite.call(this, game, x, y, data.type);

    this.anchor.setTo(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.scale.setTo(-1, 1);
    this.customData = data;
    this.frame = Math.round(Math.random());
    if(this.frame == 1){
    	this.customData.speedX += (this.customData.speedX * 0.5);
    }
};

GameObj.Enemy.prototype = Object.create(Phaser.Sprite.prototype);
GameObj.Enemy.prototype.constructor = GameObj.Enemy;

GameObj.Enemy.prototype.update = function() {
    this.body.velocity.x = this.customData.speedX;
    //kill if off screen and not already dead
    if (this.position.x <= 0 && this.alive && !this.customData.damaged) {
        this.destroy();
        GameObj.GameState.deadEnemies += 1;
    }
};

GameObj.Enemy.prototype.reset = function(x, y, data) {
    Phaser.Sprite.prototype.reset.call(this, x, y, data.type);
    this.loadTexture(data.type);
    this.customData = data;
};