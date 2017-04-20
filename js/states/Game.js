var GameObj = GameObj || {};

GameObj.GameState = {
    init: function(currentLevel) {
        //constants
        this.PLAYER_SPEED = 160;
        this.ENERGY_BLAST_SPEED = 350;
        this.KEY_DOWN_DURATION = 250;
        this.MIN_Y = 110;
        this.PLAYER_STARTING_POINT = 45;
        this.MAX_PLAYER_X = (this.game.world.width / 3 > 120) ? this.game.world.width / 3 : 120;
        this.SECONDS_BETWEEN_LEVELS = 5;
        this.ITEM_INTERVAL = 13 * 1000;
        this.ITEMS = ['healthPack', 'largeBlast', 'infiniteBlast'];

        //keyboard cursors
        this.cursors = this.game.input.keyboard.createCursorKeys();

        //attack keys
        this.elbowKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
        this.kickKey = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
        this.energyKey = this.game.input.keyboard.addKey(Phaser.Keyboard.C);
        this.pauseKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

        this.pauseKey.onDown.add(pauseGame, this);

        //level data
        this.TOTAL_LEVELS = 5;
        this.currentLevel = currentLevel ? currentLevel : 1;
        this.inputDisabled = false;
        this.playerWon = false;
        this.gameHasEnded = false;

        function pauseGame() {
            this.pauseLabel.text = '';
            GameObj.game.paused = !GameObj.game.paused;
            if (GameObj.game.paused) {
                this.pauseLabel.text = 'PAUSED';
            }
        }
    },
    create: function() {
        //sounds
        this.blastSound = this.add.audio('blast');
        this.blastSound.volume = 0.3;

        this.noEnergySound = this.add.audio('noEnergy');
        this.noEnergySound.volume = 0.3;

        this.hurtSound = this.add.audio('hurt');
        this.hurtSound.volume = 0.3;

        this.bardockHurtSound = this.add.audio('bardock_hurt');
        this.bardockHurtSound.volume = 0.3;

        this.pickupSound = this.add.audio('pickup');
        this.pickupSound.volume = 0.3;

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
        this.initializeItems();
        this.loadLevelData();

        this.game.time.events.loop(Phaser.Timer.SECOND * 4, this.restoreEnegry, this);
    },
    update: function() {
        this.player.body.velocity.y = 0;
        this.player.body.velocity.x = 0;

        if (!this.inputDisabled) {
            //collision detections
            this.game.physics.arcade.overlap(this.energyBlasts, this.enemies, this.blastEnemy, null, this);
            this.game.physics.arcade.overlap(this.player, this.enemies, this.handleAttack, null, this);
            this.game.physics.arcade.overlap(this.player, this.items, this.handleItemPickup, null, this);

            //attacks
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
            } else if (this.energyKey.downDuration(250) && this.player.customData.energy < 1) {
                this.noEnergySound.play();
            }

            //movement
            if (this.cursors.up.isDown && this.player.body.position.y > this.MIN_Y) {
                this.player.body.velocity.y = -this.PLAYER_SPEED;
            }
            if (this.cursors.down.isDown) {
                this.player.body.velocity.y = this.PLAYER_SPEED;
            }
            if (this.cursors.left.isDown && !this.cursors.right.isDown) {
                if (!this.playerAttacking && !this.blastFired) {
                    this.player.play('backward');
                }
                this.player.body.velocity.x = -this.PLAYER_SPEED;
            }
            if (this.cursors.right.isDown && this.player.body.position.x < this.MAX_PLAYER_X) {
                this.player.body.velocity.x = this.PLAYER_SPEED;
            }

            this.refreshStats();
            this.setAnimationToDefault();
            this.checkRemainingEnemyCount();
        }

        if (this.freeza) {
            //add collision detection for blast
            this.game.physics.arcade.overlap(this.freeza, this.energyBlasts, this.blastFreeza, null, this);
            if (!this.freeza.customData.isInPosition) {
                this.checkFreezaPosition();
            }

            if (this.energyBomb) {
                this.energyBomb.angle -= 0.5;
            }
        }

        if (this.gameHasEnded) {
            var self = this;
            this.game.input.keyboard.onDownCallback = function(e) {
                restartGame();
            }
            if (this.game.input.activePointer.isDown) {
                restartGame();
            }

            function restartGame() {
                self.game.input.keyboard.onDownCallback = null;
                self.state.start('Home');
            }
        }
    },
    setAnimationToDefault: function() {
        if (!this.player.animations.currentAnim.isPlaying) {
            this.player.play('forward');
        } else {
            this.player.animations.currentAnim.onComplete.add(function() {
                if (this.blastFired) {
                    this.createEnergyBlast();
                    this.blastFired = false;
                    if (!this.infiniteBlastsEnabled) {
                        this.player.customData.energy -= 1;
                    }
                }
                if (this.playerAttacking) {
                    this.playerAttacking = false;
                }
                this.player.play('forward');
            }, this);
        }
    },
    setPlayerData: function() {
        this.player = this.add.sprite(this.PLAYER_STARTING_POINT, this.game.world.centerY, 'player');
        this.player.anchor.setTo(0.5);
        this.player.animations.add('default', [0], 7, false);
        this.player.animations.add('forward', [2], 7, false);
        this.player.animations.add('backward', [3], 7, false);
        this.player.animations.add('elbow', [4], 7, false);
        this.player.animations.add('kick', [5], 7, false);
        this.player.animations.add('blast', [6, 7], 13, false);
        this.player.animations.add('damaged', [8], 3, false);
        this.player.animations.add('thrownBack', [9, 8], 2, false);
        this.player.animations.add('dazed', [11, 12], 4, true);
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;

        this.player.customData = {
            health: 100,
            maxHealth: 100,
            energy: 10,
            maxEnergy: 10,
            powerLevel: 10000,
            enemiesDefeated: 0,
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

        this.defeatedLabel = this.add.text(5, 67, 'ENEMIES DEFEATED', style);
        this.defeatedStats = this.add.text(5, 77, '', style);

        this.levelLabel = this.add.text(this.game.world.centerX - 10, this.game.world.centerY, '', levelStyle);
        this.levelLabel.anchor.setTo(0.5);

        this.pauseLabel = this.add.text(this.game.world.centerX - 10, this.game.world.centerY, '', levelStyle);
        this.pauseLabel.anchor.setTo(0.5);

        this.refreshStats();
    },
    refreshStats: function() {
        this.healthStats.text = this.player.customData.health + '/' + this.player.customData.maxHealth;
        this.energyStats.text = this.player.customData.energy + '/' + this.player.customData.maxEnergy;
        this.powerLevelStats.text = this.formatNumber(this.player.customData.powerLevel);
        this.defeatedStats.text = this.formatNumber(this.player.customData.enemiesDefeated);
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
    initializeItems: function() {
        this.items = this.add.group();
        this.items.enableBody = true;
    },
    restoreEnegry: function() {
        if (this.player.customData.energy < this.player.customData.maxEnergy) {
            var maxToRestore = Math.round(this.player.customData.maxEnergy / 10);
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
        this.blastSound.play();
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
    createItem: function(itemData) {
        var item = this.items.getFirstExists(false);
        var itemX = this.game.world.width + itemData.x;
        var itemY = itemData.y;
        if (!item) {
            item = new GameObj.Item(this.game, itemX, itemY, itemData);
            this.items.add(item);
        } else {
            item.reset(itemX, itemY, itemData);
        }
    },
    blastEnemy: function(energyBlast, enemy) {
        if (!enemy.customData.damaged) {
            enemy.frame = 3;
            enemy.customData.damaged = true;
            if (!this.largeBlastsEnabled) {
                energyBlast.kill();
            }
            this.hurtSound.play();
            this.killEnemy(enemy);
        }
    },
    handleAttack: function(player, enemy) {
        var enemyCanDamage = enemy.position.x >= player.position.x;
        if (this.playerAttacking && !enemy.customData.damaged) {
            enemy.customData.damaged = true;
            enemy.frame = 2;
            this.killEnemy(enemy);
            this.hurtSound.play();
        } else if (enemyCanDamage && !player.customData.damaged && !enemy.customData.damaged) {
            player.play('damaged');
            this.handlePlayerDamage(player);
            player.customData.damaged = true;
            this.bardockHurtSound.play();
        }
    },
    handleItemPickup: function(player, item) {
        console.log('ITEM', item);
        switch (item.customData.type) {
            case 'healthPack':
                this.restoreHealth();
                break;
            case 'largeBlast':
                this.handleLargerBlasts();
                break;
            default:
                this.handleInfiniteBlasts();
                break;
        }
        item.destroy();
        this.pickupSound.play();
    },
    restoreHealth: function() {
        var currentHealthDifference = this.player.customData.maxHealth - this.player.customData.health;
        var maxHealthRestore = Math.round(this.player.customData.maxHealth / 4);
        var amountOfHealthToRestore = maxHealthRestore;
        if ((maxHealthRestore + this.player.customData.health) > this.player.customData.maxHealth) {
            amountOfHealthToRestore = currentHealthDifference;
        }
        this.player.customData.health += amountOfHealthToRestore;
    },
    handleLargerBlasts: function() {
        this.restoreEnegry();
        var largerBlastTime = 5 * 1000;
        this.largeBlastsEnabled = true;
        this.game.time.events.add(largerBlastTime, function() {
            this.largeBlastsEnabled = false;
        }, this);
    },
    handleInfiniteBlasts: function() {
        this.restoreEnegry();
        var infiniteBlastTime = 5 * 1000;
        this.infiniteBlastsEnabled = true;
        this.game.time.events.add(infiniteBlastTime, function() {
            this.infiniteBlastsEnabled = false;
        }, this);
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
        this.player.customData.enemiesDefeated += 1;

        var healthIncrease = 1;
        var energyIncrease = 2;

        var milliLevel = Math.round(this.player.customData.powerLevel / 1000);
        if (milliLevel % 9 == 0 && milliLevel != this.currentMilliLevel) {

            //keep track of the current milliLevel
            this.currentMilliLevel = milliLevel;

            //increase and restore some health
            this.player.customData.maxHealth += healthIncrease;
            // this.restoreHealth();

            //increase and restore some energy
            this.player.customData.maxEnergy += energyIncrease;
            var currentEnergyDifference = this.player.customData.maxEnergy - this.player.customData.energy;
            var maxEnergyRestore = Math.round(this.player.customData.maxEnergy / 4);
            var amountOfEnergyToRestore = maxEnergyRestore;
            if ((maxEnergyRestore + this.player.customData.energy) > this.player.customData.maxEnergy) {
                amountOfEnergyToRestore = currentEnergyDifference;
            }
            this.player.customData.Energy += amountOfEnergyToRestore;
        }
    },
    handlePlayerDamage: function(player) {
        var damage = 5;
        player.customData.health = (player.customData.health < damage) ? 0 : player.customData.health -= damage
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
                }, 250);
            }
        }, this);
        attackedTween.start();
    },
    loadLevelData: function() {
        this.loadingNextLevel = false;
        this.levelData = JSON.parse(this.game.cache.getText('levelData'));

        var currentLevelKey = 'level-' + this.currentLevel;
        this.currentLevelData = this.levelData[currentLevelKey];
        this.levelLabel.text = 'WAVE ' + this.currentLevel;

        var self = this;
        setTimeout(function() {
            self.levelLabel.text = '';
        }, 1500);

        this.generateEnemyData();
        this.scheduleNextItem();
    },
    generateEnemyData: function() {
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
                powerUp: this.getRandomInt(300, 700)
            });
        }

        this.deadEnemies = 0;
        this.currentEnemyIndex = 0;
        this.scheduleNextEnemy();
    },
    scheduleNextEnemy: function() {
        var nextEnemy = this.currentLevelData.enemies[this.currentEnemyIndex];
        if (nextEnemy) {
            var nextTime = 1000 * (nextEnemy.time - (this.currentEnemyIndex == 0 ? 0 : this.currentLevelData.enemies[this.currentEnemyIndex - 1].time));
            this.nextEnemyTimer = this.game.time.events.add(nextTime, function() {
                this.currentEnemyIndex++;
                this.createEnemy(nextEnemy);
                this.scheduleNextEnemy();
            }, this);
        }
    },
    scheduleNextItem: function() {
        this.nextItemTimer = this.game.time.events.add(this.ITEM_INTERVAL, function() {
            if (!this.loadingNextLevel && !this.freeza) {
                var minY = this.MIN_Y;
                var maxY = this.game.world.height - 10;
                var itemType = this.ITEMS[this.getRandomInt(0, 2)];
                var minSpeed = this.currentLevelData.minSpeed;
                var maxSpeed = this.currentLevelData.maxSpeed;
                this.createItem({
                    x: 10,
                    y: this.getRandomInt(minY, maxY),
                    speedX: this.getRandomInt(minSpeed, maxSpeed),
                    type: itemType
                });
            }
            this.scheduleNextItem();
        }, this);
    },
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    checkRemainingEnemyCount: function() {
        if (this.deadEnemies == this.currentLevelData.numberOfEnemies) {
            if (this.currentLevel == this.TOTAL_LEVELS) {
                //disable input and stop the scroll background
                this.inputDisabled = true;
                var millisecondsToWait = 7 * 1000;

                this.levelLabel.text = 'FREEZA';
                var self = this;
                setTimeout(function() {
                    self.levelLabel.text = '';
                }, 3500);

                this.game.time.events.add(millisecondsToWait, function() {
                    this.encounterFreeza();
                }, this);
            } else if (!this.loadingNextLevel) {
                this.loadingNextLevel = true;
                this.game.time.events.add(this.SECONDS_BETWEEN_LEVELS, function() {
                    this.currentLevel += 1;
                    this.loadLevelData();
                }, this);
            }
        }
    },
    handleGameOver: function() {
        var self = this;
        var waitTime = 1000;
        setTimeout(function() {
            self.game.state.start('GameOver', true, false, self.player.customData);
        }, waitTime);
    },
    encounterFreeza: function() {
        this.freezaBlastSound = this.add.audio('freezaBlast');
        this.freezaBlastSound.volume = 0.3;
        //add freeza
        this.freeza = this.add.sprite(this.game.world.width + 10, this.game.world.centerY, 'freeza');
        this.freeza.anchor.setTo(0.5);
        this.freeza.scale.setTo(-1, 1);
        this.game.physics.arcade.enable(this.freeza);
        this.freeza.body.velocity.x = -100;
        this.freeza.enableBody = true;
        this.freeza.customData = {
            health: 25,
            powerLevel: 430000,
            isInPosition: false,
            damaged: false
        };

        //animations
        this.freeza.animations.add('default', [0], 7, false);
        this.freeza.animations.add('forward', [1], 7, false);
        this.freeza.animations.add('kick', [2], 7, false);
        this.freeza.animations.add('readyEnergyBomb', [3], 1, false);
        this.freeza.animations.add('fireEnergyBomb', [4], 1, false);
        this.freeza.animations.add('damagedA', [5], 1, false);
        this.freeza.animations.add('damagedB', [6], 1, false);
    },
    checkFreezaPosition: function() {
        if (this.freeza.position.x <= this.game.world.width - 20) {
            var self = this;
            this.freeza.customData.isInPosition = true;
            this.background.autoScroll(0);
            this.freeza.body.velocity.x = 0;
            this.player.body.velocity.x = 0;

            var movementTime = 500;

            //define tweens
            var playerMovement = this.game.add.tween(this.player);
            playerMovement.to({
                x: this.game.world.centerX - 30,
                y: this.game.world.centerY
            }, movementTime);

            //start tweens
            playerMovement.start();
            playerMovement.onComplete.add(function() {
                this.player.play('default');
                this.player.play('blast');
                this.createEnergyBlast();
                setTimeout(function() {
                    self.player.play('default');
                }, 500);
            }, this);
        }
    },
    blastFreeza: function(freeza, energyBlast) {
        energyBlast.kill();
        this.hurtSound.play();
        if (!this.playerWon) {
            var freezaMovement = this.game.add.tween(this.freeza);
            freezaMovement.to({
                x: this.game.world.centerX + 70,
                y: this.game.world.centerY
            }, 1500);

            freezaMovement.start();
            freezaMovement.onComplete.add(function() {
                this.handleFreezaAttack();
            }, this);
        } else {
            var freezaAttackedTween = this.game.add.tween(freeza);

            freeza.customData.damaged = (freeza.customData.damaged == 'damagedA') ? 'damagedB' : 'damagedA';
            freeza.play(freeza.customData.damaged);

            freeza.body.velocity.x = (freeza.position.x >= this.game.world.width - 100) ? 0 : 100;

            freezaAttackedTween.to({ tint: 0xFF0000 }, 100);

            freezaAttackedTween.start();
            freezaAttackedTween.onComplete.add(function() {
                freeza.tint = 0xFFFFFF;
                freeza.body.velocity.x = 0;
                freeza.customData.health--;
                if (freeza.customData.health == 0) {
                    freeza.kill();
                    var self = this;
                    setTimeout(function() {
                        self.handleEndGame(true);
                    }, 2000);
                }
            }, this);
        }
    },
    handleFreezaAttack: function() {
        var self = this;

        this.freeza.play('forward');
        var freezaMovement = this.game.add.tween(this.freeza);
        freezaMovement.to({
            x: this.player.position.x + 20,
            y: this.player.position.y
        }, 100);
        freezaMovement.start();

        freezaMovement.onComplete.add(function() {
            this.freeza.play('kick');
            this.hurtSound.play();
            this.player.play('thrownBack');

            var attackedTween = this.game.add.tween(this.player);
            var knockBack = this.player.position.x - 300;
            if (knockBack < 0) knockBack = 0;

            attackedTween.to({
                x: knockBack,
                y: this.player.position.y,
                tint: 0xFF0000
            }, 300);
            attackedTween.onComplete.add(function() {
                this.player.tint = 0xFFFFFF;
                this.player.play('dazed');
                this.handleFreezaEnergyBomb();
            }, this);
            attackedTween.start();
        }, this);
    },
    handleFreezaEnergyBomb: function() {
        var self = this;

        this.freeza.play('readyEnergyBomb');
        this.energyBomb = this.add.sprite(this.freeza.position.x + 10, this.freeza.position.y - 75, 'energyBomb');
        this.energyBomb.anchor.setTo(0.5);
        this.energyBomb.alpha = 0.8;
        this.freezaBlastSound.play();

        var fireTween = this.game.add.tween(this.energyBomb);
        fireTween.to({
            x: this.player.position.x,
            y: this.player.position.y
        }, 666);

        setTimeout(function() {
            self.freezaBlastSound.play();
            self.energyBomb.scale.setTo(1.5);
        }, 1000);

        setTimeout(function() {
            self.freezaBlastSound.play();
            self.energyBomb.scale.setTo(2);
        }, 2000);

        setTimeout(function() {
            self.freezaBlastSound.play();
            self.blastSound.play();
            self.freeza.play('fireEnergyBomb');
            fireTween.start();
        }, 3000);

        fireTween.onComplete.add(function() {
            if (this.player.customData.powerLevel >= this.freeza.customData.powerLevel) {
                this.handlePlayerWin();
            } else {
                this.handleFreezaWin();
            }
        }, this);
    },
    handleFreezaWin: function() {
        this.player.kill();
        this.energyBomb.kill();
        this.freeza.play('default');
        this.handleEndGame(false);
    },
    handlePlayerWin: function() {
        this.playerWon = true;
        this.energyBomb.kill();
        this.freeza.play('default');
        this.player.play('default');

        this.energyBlastsToThrow = 25;

        this.barrageLoop = this.game.time.events.loop(150, this.handleBarrageAttack, this);
    },
    handleBarrageAttack: function() {
        this.player.play('blast');
        this.createEnergyBlast();
        this.energyBlastsToThrow--;
        if (this.energyBlastsToThrow == 0) {
            this.game.time.events.remove(this.barrageLoop);
            this.player.play('default');
        }
    },
    handleEndGame: function(playerWon) {
        this.game.world.removeAll();
        this.gameHasEnded = true;
        var endGameMessage;
        if (playerWon) {
            endGameMessage = 'Against all odds, Bardock was able to defeat Freeza and save his planet. ' +
                'He went down in their history as the planet\'s savior and became the ' +
                'new king of planet Vegeta. Stories are still told throughout the universe ' +
                'about how King Bardock took down Freeza and ' + this.player.customData.enemiesDefeated +
                ' of his soldiers.';
        } else {
            endGameMessage = 'Despite his efforts, Bardock was unable to defeat the tyrant Freeza. ' +
                'He did however manage to take ' + this.player.customData.enemiesDefeated +
                ' of Freeza\'s soldiers down with him. Even though the planet was destroyed, ' +
                'Freeza still has many enemies. Surely one day the tyrant will answer for his ' +
                'cruelty...';
        }

        var maxWordWrapWidth = this.game.world.width - 100;
        var endGameStyle = { font: '10px PrStart', fill: '#fff', wordWrap: true, wordWrapWidth: maxWordWrapWidth };
        var endGameLabel = this.game.add.text(50, 40, endGameMessage, endGameStyle);
    }
};
