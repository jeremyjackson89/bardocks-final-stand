var GameObj = GameObj || {};

// GameObj.dim = GameObj.getGameLandscapeDimensions(440, 400);
// GameObj.game = new Phaser.Game(GameObj.dim.w, GameObj.dim.h, Phaser.AUTO);
GameObj.game = new Phaser.Game('100%', '100%', Phaser.AUTO);

GameObj.game.state.add('Boot', GameObj.BootState); 
GameObj.game.state.add('Preload', GameObj.PreloadState); 
GameObj.game.state.add('Game', GameObj.GameState);

GameObj.game.state.start('Boot'); 
