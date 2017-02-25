var GameObj = GameObj || {};

//loading the game assets
GameObj.HomeState = {
    create: function() {
        var background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');
        background.autoScroll(-30, 0);

        var maxWordWrapWidth = this.game.world.width - 100;

        var storyStyle = { font: '9px PrStart', fill: '#fff', wordWrap: true, wordWrapWidth: maxWordWrapWidth };
        var storyLabel = this.game.add.text(50, 40, '', storyStyle);
        storyLabel.text = 'The evil lord Freeza travels from world to world to ' +
                            'enslave their people and then \'employ\' them to do his bidding. ' + 
                            'A rebellion has begun to unfold on one such world -- planet Vegeta. ' + 
                            'Fearing a large uprising, Freeza decided to eliminate the threat and destroy the planet. ' +
                            'One of the planet\'s inhabitants, Bardock, has chosen to confront Freeza, ' +
                            'but he\'ll have to make it through many of Freeza\'s soldiers to get to him.' + 
                            '\nThis is...';

        var titleStyle = { font: '15px PrStart', fill: '#fff', align: 'center' };
        var titleLabel = this.game.add.text(this.game.world.centerX, 350, 'BARDOCK\'S\nFINAL STAND', titleStyle);
        titleLabel.anchor.set(0.5);

        var startStyle = { font: '10px PrStart', fill: '#fff' };
        var startLabel = this.game.add.text(this.game.world.centerX, 400, '(PRESS ANY KEY TO START)', startStyle);
        startLabel.anchor.set(0.5);

        var creditStyle = { font: '8px PrStart', fill: '#fff' };
        var createdByLabel = this.game.add.text(10, (this.game.world.height - 60), 'PROGRAMMING', startStyle);
        var creatorLabel = this.game.add.text(10, (this.game.world.height - 45), 'JEREMY JACKSON', creditStyle);
        var musicByLabel = this.game.add.text(10, (this.game.world.height - 30), 'MUSIC', startStyle);
        var musicLabel = this.game.add.text(10, (this.game.world.height - 15), 'JAMIE OBESO', creditStyle);
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
