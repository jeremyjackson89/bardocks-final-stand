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
    this.load.image('enemyEnergyBlast', 'assets/images/sprites/enemy-energy-blast.png');
    this.load.image('energyBomb', 'assets/images/sprites/energy-bomb.png');
    this.load.image('infiniteBlast', 'assets/images/sprites/item-blast-infinite.png');
    this.load.image('largeBlast', 'assets/images/sprites/item-blast-large.png');
    this.load.image('healthPack', 'assets/images/sprites/item-health.png');

    //sprite sheets
    this.load.atlasJSONHash('player', 'assets/images/bardock-sheet.png', 'assets/images/bardock-sheet.json');
    this.load.atlasJSONHash('guldo', 'assets/images/guldo-sheet.png', 'assets/images/guldo-sheet.json');
    this.load.atlasJSONHash('recoome', 'assets/images/recoome-sheet.png', 'assets/images/recoome-sheet.json');
    this.load.atlasJSONHash('jeice', 'assets/images/jeice-sheet.png', 'assets/images/jeice-sheet.json');
    this.load.atlasJSONHash('burter', 'assets/images/burter-sheet.png', 'assets/images/burter-sheet.json');
    this.load.atlasJSONHash('ginyu', 'assets/images/ginyu-sheet.png', 'assets/images/ginyu-sheet.json');
    this.load.atlasJSONHash('freeza', 'assets/images/freeza-sheet.png', 'assets/images/freeza-sheet.json');

     //sound effects
    this.load.audio('blast', ['assets/audio/blast.wav']);
    this.load.audio('explosion', ['assets/audio/explosion.wav']);
    this.load.audio('noEnergy', ['assets/audio/no_energy.wav']);
    this.load.audio('hurt', ['assets/audio/hurt.wav']);
    this.load.audio('bardock_hurt', ['assets/audio/bardock_hurt.wav']);
    this.load.audio('pickup', ['assets/audio/pickup.wav']);
    this.load.audio('freezaBlast', ['assets/audio/freeza_blast.wav']);
  },
  create: function() {
    this.state.start('Home');
  }
};