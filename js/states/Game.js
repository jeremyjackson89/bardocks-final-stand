var GameObj = GameObj || {};

GameObj.GameState = {

    init: function() {
        //constants
        this.PLAYER_SPEED = 150;
        this.ENERGY_BLAST_SPEED = 350;
        this.KEY_DOWN_DURATION = 250;

        //keyboard cursors
        this.cursors = this.game.input.keyboard.createCursorKeys();
        //attack keys
        this.elbowKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
        this.kickKey = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
        this.energyKey = this.game.input.keyboard.addKey(Phaser.Keyboard.C);

        //load enemy data
        this.load.text('enemyData', 'assets/data/enemyData.json');
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
        this.player.animations.add('blast', [6, 7], 13, false);
        this.player.animations.add('damaged', [8], 13, false);
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;
        
        this.player.customData = {
            health: 100,
            energy: 10,
            damaged: false
        };

        //set up groups
        this.initializeEnergyBlasts();
        this.initializeEnemies();

        this.game.time.events.loop(Phaser.Timer.SECOND * 2, this.restoreEnegry, this);

        var enemy = new GameObj.Enemy(this.game, this.game.world.width + 10, 250, { type: 'guldo', speedX: -90 });
        this.enemies.add(enemy);
        var enemy = new GameObj.Enemy(this.game, this.game.world.width + 10, 150, { type: 'guldo', speedX: -80 });
        this.enemies.add(enemy);
        var enemy = new GameObj.Enemy(this.game, this.game.world.width + 10, 200, { type: 'burter', speedX: -130});
        this.enemies.add(enemy);

        var enemy = new GameObj.Enemy(this.game, this.game.world.width + 10, 210, { type: 'recoome', speedX: -70});
        this.enemies.add(enemy);
        var enemy = new GameObj.Enemy(this.game, this.game.world.width + 15, 230, { type: 'ginyu', speedX: -60});
        this.enemies.add(enemy);
        var enemy = new GameObj.Enemy(this.game, this.game.world.width + 10, 120, { type: 'jeice', speedX: -97});
        this.enemies.add(enemy);
        var enemy = new GameObj.Enemy(this.game, this.game.world.width + 13, 300, { type: 'jeice', speedX: -160});
        this.enemies.add(enemy);

        this.blastFired = false;
        this.playerAttacking = false;
    },
    update: function() {
        this.player.body.velocity.y = 0;

        this.game.physics.arcade.overlap(this.energyBlasts, this.enemies, this.blastEnemy, null, this);
        this.game.physics.arcade.overlap(this.player, this.enemies, this.attack, null, this);

        if (this.elbowKey && this.elbowKey.downDuration(this.KEY_DOWN_DURATION)) {
            this.player.play('elbow');
            this.playerAttacking = true;
        }
        if (this.kickKey && this.kickKey.downDuration(this.KEY_DOWN_DURATION)) {
            this.player.play('kick');
            this.playerAttacking = true;
        }
        if (this.energyKey.isDown && this.player.customData.energy > 0) {
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
                    this.player.customData.energy -= 1;
                }
                if(this.playerAttacking){
                    this.playerAttacking = false;
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
    restoreEnegry: function(){
        var amountToRestore = 3;
        this.player.customData.energy += amountToRestore;
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
    createEnemy: function() {

    },
    blastEnemy: function(energyBlast, enemy){
        energyBlast.kill();
        this.killEnemy(enemy);
    },
    attack: function(player, enemy){
        if(this.playerAttacking){
            enemy.customData.damaged = true;
            this.killEnemy(enemy);
        } else if(!player.customData.damaged && !enemy.customData.damaged) {
            player.play('damaged');
            this.handlePlayerDamage(player);
            player.customData.damaged = true;
        }
    },
    killEnemy: function(enemy) {
        var attackedTween = this.game.add.tween(enemy);
        attackedTween.to({ tint: 0xFF0000 }, 100);
        attackedTween.onComplete.add(function() {
            enemy.tint = 0xFFFFFF;
            enemy.kill();
        }, this);
        attackedTween.start();
    },
    handlePlayerDamage: function(player){
        player.customData.health -= 25;
        var attackedTween = this.game.add.tween(player);
        attackedTween.to({ tint: 0xFF0000 }, 100);
        attackedTween.onComplete.add(function() {
            player.tint = 0xFFFFFF;
            if(player.customData.health < 1){
                player.kill();
            } else {
                //let the player be immune temporarily
                setTimeout(function(){
                  player.customData.damaged = false;
                }, 1000);
            }
        }, this);
        attackedTween.start();
    }
};
