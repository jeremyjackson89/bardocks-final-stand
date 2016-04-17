var GameObj = GameObj || {};

//loading the game assets
GameObj.HomeState = {
    create: function() {
        var background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');
        background.autoScroll(-30, 0);

        var style = { font: '11px PrStart', fill: '#fff' };
        var startLabel = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'PRESS ANY KEY TO START', style);
        startLabel.anchor.set(0.5);
    },
    update: function() {
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
