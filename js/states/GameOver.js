var GameObj = GameObj || {};

//loading the game assets
GameObj.GameOverState = {
    init: function(playerData){
        this.playerData = playerData;
    },
    create: function() {
        console.log('playerData', this.playerData);
        var background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');
        background.autoScroll(-30, 0);

        var style = { font: '11px PrStart', fill: '#fff' };
        var restartLabel = this.game.add.text(this.game.world.centerX, this.game.world.height - 100, 'PRESS ANY KEY TO RESTART', style);
        restartLabel.anchor.set(0.5);
        
        var gameOverLabel = this.game.add.text(this.game.world.centerX, 100, 'GAME OVER', style);
        gameOverLabel.anchor.set(0.5);

        this.player = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'player');
        this.player.anchor.setTo(0.5);
        this.player.scale.setTo(1.5);
        this.player.frame = 10;
    },
    update: function() {
        this.player.angle += 0.25;
        var self = this;
        this.game.input.keyboard.onDownCallback = function(e) {
            self.startGame();
        }
        if (this.game.input.activePointer.isDown) {
            self.startGame();
        }
    },
    startGame: function(event){
        this.game.input.keyboard.onDownCallback = null;
        this.state.start('Game');
    }
};
