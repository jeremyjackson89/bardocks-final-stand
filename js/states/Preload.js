var GameObj = GameObj || {};

//loading the game assets
GameObj.PreloadState = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'bar');
    this.preloadBar.anchor.setTo(0.5);
    this.preloadBar.scale.setTo(100, 1);

    this.load.setPreloadSprite(this.preloadBar);

    //load enemy data
    this.load.text('enemyData', 'assets/data/enemyData.json');
    this.load.text('levelData', 'assets/data/levelData.json');

    //load game assets
    this.load.image('space', 'assets/images/space.png');
    this.load.image('bardockFace', 'assets/images/sprites/bardock-face.png');
    this.load.image('dataPanel', 'assets/images/sprites/data-panel-2.png');
    this.load.image('energyBlast', 'assets/images/sprites/energy-blast.png');
    this.load.image('energyBomb', 'assets/images/sprites/energy-bomb.png');

    //sprite sheets
    this.load.atlasJSONHash('player', 'assets/images/bardock-sheet.png', 'assets/images/bardock-sheet.json');
    this.load.atlasJSONHash('guldo', 'assets/images/guldo-sheet.png', 'assets/images/guldo-sheet.json');
    this.load.atlasJSONHash('recoome', 'assets/images/recoome-sheet.png', 'assets/images/recoome-sheet.json');
    this.load.atlasJSONHash('jeice', 'assets/images/jeice-sheet.png', 'assets/images/jeice-sheet.json');
    this.load.atlasJSONHash('burter', 'assets/images/burter-sheet.png', 'assets/images/burter-sheet.json');
    this.load.atlasJSONHash('ginyu', 'assets/images/ginyu-sheet.png', 'assets/images/ginyu-sheet.json');
    this.load.atlasJSONHash('freeza', 'assets/images/freeza-sheet.png', 'assets/images/freeza-sheet.json');
  },
  create: function() {
    this.state.start('Home');
  }
};