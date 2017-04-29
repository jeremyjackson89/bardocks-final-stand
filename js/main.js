var GameObj = GameObj || {};
// GameObj.game = new Phaser.Game('100%', '100%', Phaser.AUTO, "gameContainer");
GameObj.game = new Phaser.Game(640, 480, Phaser.AUTO, "gameContainer");

GameObj.game.state.add('Boot', GameObj.BootState); 
GameObj.game.state.add('Preload', GameObj.PreloadState); 
GameObj.game.state.add('Home', GameObj.HomeState);
GameObj.game.state.add('Game', GameObj.GameState);
GameObj.game.state.add('GameOver', GameObj.GameOverState);

GameObj.game.state.start('Boot'); 
