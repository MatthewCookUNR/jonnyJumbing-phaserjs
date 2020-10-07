  /*
  *
  *
  * Class file used for running the main scene
  * 
  * 
  */

class SceneMain extends Phaser.Scene {
  constructor() {
    super("SceneMain");
  }

  preload () {
    this.load.image('platform', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/platform.png');
    this.load.image('grassTile', 'assets/platforms/grassTile.png')
    this.load.image('blasterArrow', 'assets/other/blue_arrow.png');
    this.load.image('pinkBeam', 'assets/other/pink_beam.png');
    this.load.audio('playerBlasterSound', 'assets/sounds/player_blaster_sound.mp3');
    this.load.spritesheet('playerIdle', 'assets/spritesheets/player/player_idle.png', { frameWidth: 52, frameHeight: 39 });
    this.load.spritesheet('playerRun', 'assets/spritesheets/player/player_run.png', { frameWidth: 52, frameHeight: 39 });
    this.load.spritesheet('playerAttack1', 'assets/spritesheets/player/player_attack_p1.png', {frameWidth: 52, frameHeight: 39} )
    this.load.spritesheet('playerAttack2', 'assets/spritesheets/player/player_attack_p2.png', {frameWidth: 52, frameHeight: 39} )
    this.load.spritesheet('playerAttack3', 'assets/spritesheets/player/player_attack_p3.png', {frameWidth: 52, frameHeight: 39} )
    this.load.spritesheet('skeletonIdle', 'assets/spritesheets/enemies/skeleton/Idle.png', { frameWidth: 150, frameHeight: 150 })
    this.load.spritesheet('skeletonWalk', 'assets/spritesheets/enemies/skeleton/Walk.png', { frameWidth: 150, frameHeight: 150 })
  }
  
  //Initializes player and other objects that are there at start
  //of the game
  create () {
    //Create Static Groups
    gameState.platforms = this.physics.add.staticGroup();
    gameState.platformBuffer = this.physics.add.staticGroup();
    gameState.playerAttackBox = this.physics.add.staticGroup();

    //Create Groups
    gameState.projectiles = this.physics.add.group();
    gameState.enemies = this.physics.add.group();

    //Create game objects/data


    gameState.clockReady = false;

    gameState.player = this.physics.add.sprite(25, 300, 'playerIdle').setScale(1.4).setSize(25, 30, true).setGravityY(200);
    gameState.player.jumbReady = true;
    gameState.player.setCollideWorldBounds(true);
    gameState.player.attackPhase = 0;

    //Create AlignGrid for placing objects/platforms
    gameState.aGrid = new AlignGrid({scene:this,rows:11,cols:20});
    //gameState.aGrid.showNumbers();
    gameState.aGrid.placeAtIndex(120,gameState.player);


    //Create Level Platforms
    createLevelOneGamePlatforms(this);
    createLevelBoundary(this);

    //Create on-screen display UI
    gameState.scoreText = this.add.text(320, 365, 'Score: 0', { fontSize: '15px', fill: '#000' })
      
    //Collider for player to not fall through platforms
    this.physics.add.collider(gameState.player, gameState.platforms, function () {
      gameState.player.jumbReady = true;
    });
  
    //Overlap collider enemies to add buffer at end of platforms to help keep enemies
    //from walking off
    this.physics.add.overlap(gameState.enemies, gameState.platformBuffer, function (enemy) {
      if(enemy.body.touching.right) {
        enemy.setVelocityX(-25);
        enemy.flipX = true;
        //enemy.anims.play('skeletonIdle');
      }
      else if(enemy.body.touching.left) {
          enemy.setVelocityX(25);
          enemy.flipX = false;
      }
    });

    //Overlap collider enemies to add buffer at end of platforms to help keep enemies
    //from walking off
    this.physics.add.overlap(gameState.enemies, gameState.playerAttackBox, function (enemy, attackBox) {
      enemy.health--;
      if(enemy.health === 0) {
        enemy.destroy();
      }
    });
      
    //Collider for enemies to bounce movement
    //when they hit a platform from left or right side
    this.physics.add.collider(gameState.enemies, gameState.platforms, function (enemy) {
      if(enemy.body.touching.left) {
        enemy.setVelocityX(25);
        enemy.flipX = false;
      }
      else if (enemy.body.touching.right) {
        enemy.setVelocityX(-25);
        enemy.flipX = true;
      }
    });
  
    gameState.player.angle = 360;
  
    enemyGen(5, 'skeletonWalk');

  
    //Player Animations
    this.anims.create({
      key: 'playerIdle',
      frames: this.anims.generateFrameNumbers('playerIdle', { start: 1, end: 3 }),
      frameRate: 3,
      repeat: -1
    });
  
    this.anims.create({
      key: 'playerRun',
      frames: this.anims.generateFrameNumbers('playerRun', { start: 1, end: 6 }),
      frameRate: 6,
      repeat: 0
    });

    this.anims.create({
      key: 'playerAttack1',
      frames: this.anims.generateFrameNumbers('playerAttack1', { start: 1, end: 5 }),
      frameRate: 5,
      repeat: 0
    })  

    this.anims.create({
      key: 'playerAttack2',
      frames: this.anims.generateFrameNumbers('playerAttack2', { start: 1, end: 5 }),
      frameRate: 5,
      repeat: 0
    })  

    this.anims.create({
      key: 'playerAttack3',
      frames: this.anims.generateFrameNumbers('playerAttack3', { start: 1, end: 5 }),
      frameRate: 5,
      repeat: 0
    })  

    //Enemy Animations
  
    this.anims.create({
      key: 'skeletonIdle',
      frames: this.anims.generateFrameNumbers('skeletonIdle', { start: 1, end: 4 }),
      frameRate: 5,
      repeat: -1
    })  

    this.anims.create({
      key: 'skeletonWalk',
      frames: this.anims.generateFrameNumbers('skeletonWalk', { start: 1, end: 4 }),
      frameRate: 5,
      repeat: -1
    })
  }
  
  //Runs every frame
  update () {
  
    //Declare Possible Keys
    this.cursors = this.input.keyboard.addKeys(
      {up:Phaser.Input.Keyboard.KeyCodes.W,
      down:Phaser.Input.Keyboard.KeyCodes.S,
      left:Phaser.Input.Keyboard.KeyCodes.A,
      right:Phaser.Input.Keyboard.KeyCodes.D,
      eKey:Phaser.Input.Keyboard.KeyCodes.E,
      spacebar: Phaser.Input.Keyboard.KeyCodes.SPACE});
  
    //initialize clocks for cooldowns
    if(!gameState.clockReady) {
      gameState.gameClock = new Phaser.Time.Clock(this);
      gameState.gameClock = this.time;
      gameState.arrowClockSnapshot = gameState.gameClock.now;
      gameState.attackClockSnapshot = gameState.gameClock.now;
      gameState.playerAttackHitBoxClock = null;
      gameState.clockReady = true;
    }
  
    gameState.gameClock = this.time;

    /*
    *
    *
    * MOVEMENT FUNCTIONALITY
    * 
    * 
    */

    //Press A: move left
    if(this.cursors.left.isDown){
      gameState.player.setVelocityX(-200)
      if(!gameState.isAiming) {
        gameState.player.anims.play('playerRun', true);
      }
      if(gameState.player.attackPhase != 0) 
      {
        gameState.player.attackPhase = 0;
        gameState.playerAttackHitBoxClock = null;
      }
      if(gameState.blasterArrow && !gameState.player.flipX) {
        let flipAngle = flipRotationAlongXAxis(gameState.blasterArrow.angle);
        Phaser.Actions.RotateAround([gameState.blasterArrow], gameState.player, Phaser.Math.DegToRad(flipAngle));
        gameState.blasterArrow.reverse = !gameState.blasterArrow.reverse;
      }
      gameState.player.flipX = true;
    } 
    //Press D: move right
    else if (this.cursors.right.isDown) {
      gameState.player.setVelocityX(200)
      if(!gameState.isAiming) {
        gameState.player.anims.play('playerRun', true);
      }
      if(gameState.player.attackPhase != 0) 
      {
        gameState.player.attackPhase = 0;
        gameState.playerAttackHitBoxClock = null;
      }
      if(gameState.blasterArrow && gameState.player.flipX) {
        let flipAngle = flipRotationAlongXAxis(gameState.blasterArrow.angle);
        Phaser.Actions.RotateAround([gameState.blasterArrow], gameState.player, Phaser.Math.DegToRad(flipAngle));
        gameState.blasterArrow.reverse = !gameState.blasterArrow.reverse;
      }
      gameState.player.flipX = false;
    }
    //Else idle and stop moving horizontally
    else {
      gameState.player.setVelocityX(0);
      /*console.log(gameState.player.anims.isPlaying);
      if(gameState.player.anims.isPlaying) {
        console.log(gameState.player.anims.currentAnim.key == 'playerAttack1');
      }*/

      if(!gameState.isAiming) {
        if(gameState.player.anims.isPlaying && 
          (!gameState.player.anims.currentAnim.key == 'playerAttack1'
          || !gameState.player.anims.currentAnim.key == 'playerAttack2'
          || !gameState.player.anims.currentAnim.key == 'playerAttack3')) {
            gameState.player.anims.play('playerIdle', true);
        }
        else if(gameState.player.anims.isPlaying && gameState.player.anims.currentAnim.key == 'playerRun') {
          gameState.player.anims.play('playerIdle', true);
        }
        else if(!gameState.player.anims.isPlaying) {
          gameState.player.anims.play('playerIdle', true);
        }
      }
    }
    
    //Press W: Jumping
    if(this.cursors.up.isDown && gameState.player.jumbReady) {
      gameState.player.jumbReady = false;
      gameState.player.setVelocityY(-250);
    }
  
    /*
    *
    *
    * SPECIAL ARROW ATTACK
    * 
    * 
    */
    //Press E: Create Arrow
    if(this.cursors.eKey.isDown && !gameState.isAiming) {
      if(cooldownReady(gameState.arrowClockSnapshot, gameState.gameClock.now, 2000)) {
          gameState.player.setVelocityX(0);
          gameState.player.anims.pause();
          this.physics.pause();
          gameState.isAiming = true;
          if(gameState.player.flipX) {
          gameState.blasterArrow = this.add.image(gameState.player.x - 60, gameState.player.y, 'blasterArrow').setScale(0.8);
          gameState.blasterArrow.reverse = false;
        }
        else {
          gameState.blasterArrow = this.add.image(gameState.player.x + 60, gameState.player.y, 'blasterArrow').setScale(0.8);
          gameState.blasterArrow.reverse = true;
        }
        gameState.arrowClockSnapshot = gameState.gameClock.now;
      }
    }

    //Handles gun aiming arrow movement
    if(gameState.blasterArrow) {
      //Calculates direction pointing from player
      var angleDeg = Math.atan2(gameState.blasterArrow.y - gameState.player.y, gameState.blasterArrow.x - gameState.player.x) * 180 / Math.PI;
      gameState.blasterArrow.angle = angleDeg+180;
      //Right Pointing Arrow
      if(!gameState.player.flipX) {
        if(gameState.blasterArrow.reverse) {
          Phaser.Actions.RotateAroundDistance([gameState.blasterArrow], gameState.player, +0.04, 75);
          if(shouldArrowReverse(Math.ceil(angleDeg), Phaser.Math.Angle.WrapDegrees(75))) {
            gameState.blasterArrow.reverse = false;
          }
        }	
        else {
          Phaser.Actions.RotateAroundDistance([gameState.blasterArrow], gameState.player, -0.04, 75);
          if(shouldArrowReverse(Math.floor(angleDeg), Phaser.Math.Angle.WrapDegrees(-75))) {
            gameState.blasterArrow.reverse = true;
          }
        }
      }
      //Left Pointing Arrow
      else {
        if(gameState.blasterArrow.reverse) {
          Phaser.Actions.RotateAroundDistance([gameState.blasterArrow], gameState.player, +0.04, 75);
          if(shouldArrowReverse(Math.ceil(angleDeg), Phaser.Math.Angle.WrapDegrees(-105))) {
            gameState.blasterArrow.reverse = false;
          }
        }	
        else {
          Phaser.Actions.RotateAroundDistance([gameState.blasterArrow], gameState.player, -0.04, 75);
          if(shouldArrowReverse(Math.floor(angleDeg), Phaser.Math.Angle.WrapDegrees(105))) {
            gameState.blasterArrow.reverse = true;
          }
        }
      }  
  
      //Handles if the spacebar is pressed with aiming arrow 
      //which ----> shoots the gun
      if(this.cursors.spacebar.isDown 
        && gameState.isAiming
        && cooldownReady(gameState.arrowClockSnapshot, gameState.gameClock.now, 1000  )) {
        let projectile = createProjectile(this);
        projectile.angle = angleDeg;
        gameState.projectiles.add(projectile);
        gameState.arrowClockSnapshot = gameState.gameClock.now;
        gameState.blasterArrow.destroy();
        gameState.blasterArrow = null;
        gameState.isAiming = false;
        this.sound.play('playerBlasterSound', { volume: 0.25	});
        this.physics.resume();
  
      }
    }
    
    //Handles Projectile Movement
    if(gameState.projectiles.getChildren().length) {
      let bullets = gameState.projectiles.getChildren();
      for(let i = 0; i < bullets.length; i++) {
        const vec = this.physics.velocityFromAngle(bullets[i].angle, 500);
        bullets[i].setVelocityX(vec.x);
        bullets[i].setVelocityY(vec.y);
      }
    }

    /*
    *
    *
    * MELEE ATTACK
    * 
    * 
    */

    //Removes unhit hitbox if it exists
    if(gameState.playerAttackBox.getChildren().length != 0) {
      gameState.playerAttackBox.getChildren()[0].destroy();
    }

    //Handle Player Hitbox for Attacks
    if(gameState.playerAttackHitBoxClock) {
      if(cooldownReady(gameState.playerAttackHitBoxClock, gameState.gameClock.now, 400)) {
        gameState.playerAttackHitBoxClock = null;
        let block;
        if(gameState.player.flipX) {
          block = this.add.sprite(gameState.player.x-20,gameState.player.y ,'grassTile').setScale(0.5).setVisible(false);
        }
        else {
          block = this.add.sprite(gameState.player.x+20,gameState.player.y,'grassTile').setScale(0.5).setVisible(false);
        }
        gameState.playerAttackBox.add(block);
      }
    }
  
    //Press Spacebar: Melee Attack
    if(this.cursors.spacebar.isDown
       && !this.cursors.left.isDown
       && !this.cursors.right.isDown
       && !gameState.isAiming
       && cooldownReady(gameState.attackClockSnapshot, gameState.gameClock.now, 500)) {
        if(gameState.player.attackPhase === 0) {
          gameState.player.anims.play('playerAttack1');
          gameState.attackClockSnapshot = gameState.gameClock.now;
          gameState.playerAttackHitBoxClock = gameState.gameClock.now;
          gameState.player.attackPhase = 1;
          //console.log("Attack 1");
        }
        else if(gameState.player.attackPhase === 1) {
          gameState.player.anims.play('playerAttack2');
          gameState.attackClockSnapshot = gameState.gameClock.now;
          gameState.playerAttackHitBoxClock = gameState.gameClock.now;
          gameState.player.attackPhase = 2;
          //console.log("Attack 2");
        }
        else if(gameState.player.attackPhase === 2) {
          gameState.player.anims.play('playerAttack3');
          gameState.attackClockSnapshot = gameState.gameClock.now;
          gameState.playerAttackHitBoxClock = gameState.gameClock.now;
          gameState.player.attackPhase = 3;
          //console.log("Attack 3");
        }
    }

    //Resets Attack Cooldown if not actions taken and time passes
    if(cooldownReady(gameState.attackClockSnapshot, gameState.gameClock.now, 500)) {
      gameState.player.attackPhase = 0;
    }
  
    /*
    *
    *
    * ENEMY
    * 
    */
    //Handles Enemies
      let enemies = gameState.enemies.getChildren();
      updateEnemies(enemies)
      for(let i = 0; i < enemies.length; i++) {
        if(!gameState.blasterArrow) {
          enemies[i].anims.play('skeletonWalk', true);
        }
        else {
          enemies[i].anims.pause();
        }
      }
  }
}

function createLevelOneGamePlatforms(scene) {
  placeBlock(scene, 125, 'grassTile');
  placeBlock(scene, 126, 'grassTile');
  placeBlock(scene, 127, 'grassTile');
  placeBlock(scene, 128, 'grassTile');
  placeBlock(scene, 129, 'grassTile');
  placeBlockBuffer(scene, 104, 'grassTile');
  placeBlockBuffer(scene, 110, 'grassTile');
  placePlatform(scene, 160, 'platform');
}

function createLevelBoundary(scene) {
  for(let i = 0; i < 8; i++) {
    placeBlockBuffer(scene, i*20, 'grassTile');
    placeBlockBuffer(scene, ((i+1)*20-1), 'grassTile');
  }
  for(let i = 1; i < 19; i++) {
    placeBlockBuffer(scene, i, 'grassTile');
  }
}