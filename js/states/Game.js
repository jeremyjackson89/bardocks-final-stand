var GameObj = GameObj || {};

GameObj.GameState = {
    init: function(currentLevel) {
        //constants
        this.PLAYER_SPEED = 150;
        this.ENERGY_BLAST_SPEED = 350;
        this.KEY_DOWN_DURATION = 250;
        this.MIN_Y = 80;
        this.SECONDS_BETWEEN_LEVELS = 5;

        //keyboard cursors
        this.cursors = this.game.input.keyboard.createCursorKeys();

        //attack keys
        this.elbowKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
        this.kickKey = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
        this.energyKey = this.game.input.keyboard.addKey(Phaser.Keyboard.C);

        //level data
        this.TOTAL_LEVELS = 5;
        this.currentLevel = currentLevel ? currentLevel : 1;
    },
    create: function() {
        this.enemyData = JSON.parse(this.game.cache.getText('enemyData'));
        //background
        this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');
        this.background.autoScroll(-130, 0);

        //player
        this.setPlayerData();

        //GUI
        this.makeGUI();

        //set up groups
        this.initializeEnergyBlasts();
        this.initializeEnemies();
        this.loadLevelData();

        this.game.time.events.loop(Phaser.Timer.SECOND * 2, this.restoreEnegry, this);
    },
    update: function() {
        this.player.body.velocity.y = 0;

        //collision detections
        this.game.physics.arcade.overlap(this.energyBlasts, this.enemies, this.blastEnemy, null, this);
        this.game.physics.arcade.overlap(this.player, this.enemies, this.handleAttack, null, this);

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
        if (this.cursors.up.isDown && this.player.body.position.y > this.MIN_Y) {
            this.player.body.velocity.y = -this.PLAYER_SPEED;
        }
        if (this.cursors.down.isDown) {
            this.player.body.velocity.y = this.PLAYER_SPEED;
        }
        this.refreshStats();
        this.setAnimationToDefault();
        this.checkRemainingEnemyCount();
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
                if (this.playerAttacking) {
                    this.playerAttacking = false;
                }
                this.player.play('forward');
            }, this);
        }
    },
    setPlayerData: function() {
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
            maxHealth: 100,
            energy: 10,
            maxEnergy: 10,
            powerLevel: 10000,
            damaged: false
        };

        this.blastFired = false;
        this.playerAttacking = false;
        this.currentMilliLevel = Math.round(this.player.customData.powerLevel / 1000);
    },
    makeGUI: function() {
        //data panel GUI
        var style = { font: '8px PrStart', fill: '#fff' };
        var levelStyle = { font: '12px PrStart', fill: '#fff' };
        this.dataPanel = this.add.sprite(0, 0, 'dataPanel');
        this.dataPanel.alpha = 0.6;
        this.playerFace = this.add.sprite(5, 5, 'bardockFace');
        this.healthLabel = this.add.text(50, 7, 'HEALTH:', style);
        this.healthStats = this.add.text(110, 7, '', style);
        this.energyLabel = this.add.text(50, 17, 'ENERGY:', style);
        this.energyStats = this.add.text(110, 17, '', style);
        this.powerLevelLabel = this.add.text(50, 37, 'POWER LEVEL', style);
        this.powerLevelStats = this.add.text(50, 47, '', style);
        this.levelLabel = this.add.text(this.game.world.centerX, this.game.world.centerY, '', levelStyle);
        this.refreshStats();
    },
    refreshStats: function() {
        this.healthStats.text = this.player.customData.health;
        this.energyStats.text = this.player.customData.energy;
        this.powerLevelStats.text = this.formatNumber(this.player.customData.powerLevel);
    },
    formatNumber: function(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    initializeEnergyBlasts: function() {
        this.energyBlasts = this.add.group();
        this.energyBlasts.enableBody = true;
    },
    initializeEnemies: function() {
        this.enemies = this.add.group();
        this.enemies.enableBody = true;
    },
    restoreEnegry: function() {
        if (this.player.customData.energy < this.player.customData.maxEnergy) {
            var maxToRestore = 2;
            var currentDifference = this.player.customData.maxEnergy - this.player.customData.energy;
            var amountToRestore = (currentDifference == 1) ? 1 : maxToRestore;
            this.player.customData.energy += amountToRestore;
        }
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
    createEnemy: function(enemyData) {
        var enemy = this.enemies.getFirstExists(false);
        var enemyX = this.game.world.width + enemyData.x;
        var enemyY = enemyData.y;
        if (!enemy) {
            enemy = new GameObj.Enemy(this.game, enemyX, enemyY, enemyData);
            this.enemies.add(enemy);
        } else {
            enemy.reset(enemyX, enemyY, enemyData);
        }
    },
    blastEnemy: function(energyBlast, enemy) {
        if (!enemy.customData.damaged) {
            enemy.frame = 3;
            enemy.customData.damaged = true;
            energyBlast.kill();
            this.killEnemy(enemy);
        }
    },
    handleAttack: function(player, enemy) {
        if (this.playerAttacking && !enemy.customData.damaged) {
            enemy.customData.damaged = true;
            enemy.frame = 2;
            this.killEnemy(enemy);
        } else if (!player.customData.damaged && !enemy.customData.damaged) {
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
            this.increasePlayerStats(enemy.customData.powerUp);
            this.deadEnemies += 1;
        }, this);
        attackedTween.start();
    },
    increasePlayerStats: function(powerUp) {
        this.player.customData.powerLevel += powerUp;
        var milliLevel = Math.round(this.player.customData.powerLevel / 1000);
        if (milliLevel % 5 == 0 && milliLevel != this.currentMilliLevel) {
            this.currentMilliLevel = milliLevel;
            this.player.customData.maxHealth += 5;
            this.player.customData.health += Math.round(this.player.customData.maxHealth / 4);
            this.player.customData.maxEnergy += 3;
            this.player.customData.energy += Math.round(this.player.customData.maxEnergy / 4);
        }
    },
    handlePlayerDamage: function(player) {
        player.customData.health = (player.customData.health < 10) ? 0 : player.customData.health -= 10
        var attackedTween = this.game.add.tween(player);
        attackedTween.to({ tint: 0xFF0000 }, 100);
        attackedTween.onComplete.add(function() {
            player.tint = 0xFFFFFF;
            if (player.customData.health < 1) {
                player.kill();
                this.handleGameOver();
            } else {
                //let the player be invincible for a second after being hit
                setTimeout(function() {
                    player.customData.damaged = false;
                }, 1000);
            }
        }, this);
        attackedTween.start();
    },
    loadLevelData: function() {
        this.loadingNextLevel = false;
        console.log('current level:' + this.currentLevel);
        this.levelData = JSON.parse(this.game.cache.getText('levelData'));
        var currentLevelKey = 'level-' + this.currentLevel;
        this.currentLevelData = this.levelData[currentLevelKey];
        this.levelLabel.text = 'LEVEL ' + this.currentLevel;
        
        var self = this;
        setTimeout(function(){
             self.levelLabel.text = '';
        }, 1500);

        this.generateEnemies();
    },
    generateEnemies: function() {
        var startingX = 10;
        var allowedTypes = this.currentLevelData.enemies;
        var maxIndex = allowedTypes.length - 1;

        var minSpeed = this.currentLevelData.minSpeed;
        var maxSpeed = this.currentLevelData.maxSpeed;
        var minY = this.MIN_Y;
        var maxY = this.game.world.height - 10;

        var enemiesToMake = this.currentLevelData.numberOfEnemies;
        this.currentLevelData.enemies = [];

        for (var i = 0; i < enemiesToMake; i++) {
            var randomTypeIndex = this.getRandomInt(0, maxIndex);
            this.currentLevelData.enemies.push({
                x: startingX,
                y: this.getRandomInt(minY, maxY),
                speedX: this.getRandomInt(minSpeed, maxSpeed),
                type: allowedTypes[randomTypeIndex],
                time: this.getRandomInt(1, 2),
                powerUp: this.getRandomInt(100, 300)
            });
        }

        this.deadEnemies = 0;
        this.currentEnemyIndex = 0;
        this.scheduleNextEnemy();
    },
    scheduleNextEnemy: function() {
        var nextEnemy = this.currentLevelData.enemies[this.currentEnemyIndex];
        if (nextEnemy) {
            var nextTime = 1000 * (nextEnemy.time - (this.currentEnemyIndex == 0 ? 0 : this.enemyData.enemies[this.currentEnemyIndex - 1].time));
            this.nextEnemyTimer = this.game.time.events.add(nextTime, function() {
                this.currentEnemyIndex++;
                this.createEnemy(nextEnemy);
                this.scheduleNextEnemy();
            }, this);
        }
    },
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    checkRemainingEnemyCount: function() {
        if (this.deadEnemies == this.currentLevelData.numberOfEnemies) {
            if (this.currentLevel == this.TOTAL_LEVELS) {
                alert('You won! :D');
                this.game.state.start('Game', true, false, 1);
            } else if(!this.loadingNextLevel) {
                this.loadingNextLevel = true;
                this.game.time.events.add(this.SECONDS_BETWEEN_LEVELS, function() {
                    this.currentLevel += 1;
                    this.loadLevelData();
                }, this);
            }
        }
    },
    handleGameOver: function() {
        alert('You died! :(');
        this.game.state.start('Game', true, false, 1);
    }
};