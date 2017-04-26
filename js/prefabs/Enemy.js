var GameObj = GameObj || {};

GameObj.Enemy = function(game, x, y, data) {
    Phaser.Sprite.call(this, game, x, y, data.type);

    this.anchor.setTo(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.scale.setTo(-1, 1);
    this.customData = data;
    this.frame = Math.round(Math.random());

    if (this.customData.canUseEnergyBlast) {
        this.scheduleNextEnergyBlast();
    }

    if (this.frame == 1) {
        this.customData.speedX += (this.customData.speedX * 0.5);
    }
};

GameObj.Enemy.prototype = Object.create(Phaser.Sprite.prototype);
GameObj.Enemy.prototype.constructor = GameObj.Enemy;

GameObj.Enemy.prototype.update = function() {
    this.body.velocity.x = this.customData.speedX;
    this.position.y = this.position.y;

    var randomSpeed = getRandomSpeed();

    if (this.position.y < GameObj.GameState.player.y) {
        this.position.y += randomSpeed;
    }

    if (this.position.y > GameObj.GameState.player.y) {
        this.position.y -= randomSpeed;
    }

    if (this.customData.damaged) {
        this.body.velocity.x = 0;
    }

    //kill if off screen and not already dead
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

GameObj.Enemy.prototype.scheduleNextEnergyBlast = function() {
    var randomTime = GameObj.GameState.getRandomInt(2000, 2500);
    GameObj.game.time.events.add(randomTime, function() {
        if (this.customData.damaged) {
            return this.scheduleNextEnergyBlast();
        }
        this.createEnergyBlast();
        this.scheduleNextEnergyBlast();
    }, this);
}

GameObj.Enemy.prototype.createEnergyBlast = function() {
    var blastPoseTime = 250;
    var originalFrame = this.frame;
    var energyBlast = GameObj.GameState.enemyEnergyBlasts.getFirstExists(false);
    var energyBlastX = this.position.x - 25;
    var energyBlastY = this.position.y;
    this.frame = 4;
    if (!energyBlast) {
        energyBlast = new GameObj.EnemyEnergyBlast(GameObj.game, energyBlastX, energyBlastY);
        GameObj.GameState.enemyEnergyBlasts.add(energyBlast);
    } else {
        //reset the position of the eneryBlast
        energyBlast.reset(energyBlastX, energyBlastY);
    }
    //set velocity
    energyBlast.body.velocity.x = (this.customData.speedX * 1.5);
    GameObj.GameState.blastSound.play();
    GameObj.game.time.events.add(blastPoseTime, function() {
        this.frame = originalFrame;
    }, this);
};

function getRandomSpeed() {
    var min = 0.2;
    var max = 0.9;
    return Math.floor(Math.random() * (max - min + 1) + min);
}
