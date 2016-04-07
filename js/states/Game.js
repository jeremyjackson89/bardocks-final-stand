var GameObj = GameObj || {};

GameObj.GameState = {

    init: function() {
        //constants
        this.PLAYER_SPEED = 150;
        this.ENERGY_BLAST_SPEED = 350;

        //keyboard cursors
        this.cursors = this.game.input.keyboard.createCursorKeys();
    },
    create: function() {
        //background
        this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');
        this.background.autoScroll(-130, 0);

        //player
        this.player = this.add.sprite(45, this.game.world.centerY, 'player');
        this.player.anchor.setTo(0.5);
        this.player.animations.add('forward', [2], 7, false);
        this.player.animations.add('elbow', [4], 7, false);
        this.player.animations.add('kick', [5], 7, false);
        this.player.animations.add('blast', [6, 7], 15, false);
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;

        console.log('player', this.player)

        this.initializeEnergyBlasts();
        this.initializeEnemies();
        this.blastFired = false;
    },
    update: function() {
        this.player.body.velocity.y = 0;

        if (this.game.input.keyboard.isDown(Phaser.Keyboard.Z)) {
            this.player.play('elbow');
        }
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.X)) {
            this.player.play('kick');
        }
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.C)) {
            this.player.play('blast');
            this.blastFired = true;
        }
        if (this.cursors.up.isDown) {
            this.player.body.velocity.y = -this.PLAYER_SPEED;
        }
        if (this.cursors.down.isDown) {
            this.player.body.velocity.y = this.PLAYER_SPEED;
        }
        this.setAnimationToDefault();
    },
    setAnimationToDefault: function() {
        if (!this.player.animations.currentAnim.isPlaying) {
            this.player.play('forward');
        } else {
            this.player.animations.currentAnim.onComplete.add(function() {
                if (this.blastFired) {
                    this.createEnergyBlast();
                    this.blastFired = false;
                }
                this.player.play('forward');
            }, this);
        }
    },
    initializeEnergyBlasts: function() {
        this.energyBlasts = this.add.group();
        this.energyBlasts.enableBody = true;
    },
    initializeEnemies: function() {
        this.enemies = this.add.group();
        this.enemies.enableBody = true;
    },
    createEnergyBlast: function() {
        var energyBlast = this.energyBlasts.getFirstExists(false);
        var energyBlastX = this.player.x + 30;
        var energyBlastY = this.player.y;
        if (!energyBlast) {
            energyBlast = new GameObj.EnergyBlast(this.game, energyBlastX, energyBlastY);
            this.energyBlasts.add(energyBlast);
        } else {
            //reset the position of the eneryBlast
            energyBlast.reset(energyBlastX, energyBlastY);
        }
        //set velocity
        energyBlast.body.velocity.x = this.ENERGY_BLAST_SPEED;
    },
    createEnemy: function(){

    }
};
