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
    this.load.spritesheet('playerIdle', 'assets/spritesheets/player/Gunner_Blue_Idle.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('playerRun', 'assets/spritesheets/player/Gunner_Blue_Run.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('skeletonIdle', 'assets/spritesheets/enemies/skeleton/Idle.png', { frameWidth: 150, frameHeight: 150 })
    this.load.spritesheet('skeletonWalk', 'assets/spritesheets/enemies/skeleton/Walk.png', { frameWidth: 150, frameHeight: 150 })
  }
  
  //Initializes player and other objects that are there at start
  //of the game
  create () {
    gameState.platforms = this.physics.add.staticGroup();
    gameState.platformBuffer = this.physics.add.staticGroup();
  
    gameState.projectiles = this.physics.add.group();
    gameState.enemies = this.physics.add.group();
  
    gameState.platforms.create(320, 350, 'platform').setScale(2, 0.5).refreshBody();
  
    //Create Scene 1 Platforms
    createCombinedPlatform(gameState.platforms, gameState.platformBuffer, 125, 280, 'grassTile', 0.8, 0.8, 4);
    createCombinedPlatform(gameState.platforms, gameState.platformBuffer, 400, 280, 'grassTile', 0.8, 0.8, 4);
  
    gameState.scoreText = this.add.text(320, 340, 'Score: 0', { fontSize: '15px', fill: '#000' })
    gameState.clockReady = false;
  
    gameState.player = this.physics.add.sprite(25, 300, 'playerIdle').setScale(1).setSize(35, 35, true).setGravityY(200);
    gameState.player.jumbReady = true;
    
    gameState.player.setCollideWorldBounds(true);
  
    this.physics.add.collider(gameState.player, gameState.platforms, function () {
      gameState.player.jumbReady = true;
    });
  
    this.physics.add.overlap(gameState.enemies, gameState.platformBuffer, function (enemy) {
      if(enemy.body.velocity.x > 0) {
        enemy.setVelocityX(-25);
        if(enemy.body.blocked) {
          enemy.x = enemy.x - 1
        }
      }
      else {
        enemy.setVelocityX(25);
        if(enemy.body.blocked) {
          enemy.x = enemy.x + 1
        }
      }
    });
  
  
    gameState.player.angle = 360;
  
    enemyGen(5);
  
    //New Code Character Animations
    this.anims.create({
      key: 'playerIdle',
      frames: this.anims.generateFrameNumbers('playerIdle', { start: 1, end: 5 }),
      frameRate: 5,
      repeat: -1
    });
  
    this.anims.create({
      key: 'playerRun',
      frames: this.anims.generateFrameNumbers('playerRun', { start: 1, end: 5 }),
      frameRate: 5,
      repeat: -1
    });
  
    this.anims.create({
      key: 'skeletonIdle',
      frames: this.anims.generateFrameNumbers('skeletonIdle', { start: 1, end: 4 }),
      frameRate: 5,
      repeat: -1
    })
  
    //Colliders
    this.physics.add.collider(gameState.enemies, gameState.platforms);
  
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
      gameState.blasterClockSnapshot = gameState.gameClock.now;
      gameState.clockReady = true;
    }
  
    gameState.gameClock = this.time;
      //Movement and "Jumbing"
      //Press A: move left
        if(this.cursors.left.isDown){
          gameState.player.setVelocityX(-200)
          if(!gameState.isAiming) {
            gameState.player.anims.play('playerRun', true);
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
          if(!gameState.isAiming) {
            gameState.player.anims.play('playerIdle', true);
          }
        }
    
        //Press W: Jumping
        if(this.cursors.up.isDown && gameState.player.jumbReady) {
          gameState.player.jumbReady = false;
          gameState.player.setVelocityY(-250);
        }
  
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
  
    //Press Spacebar: Fire Blaster
    if(this.cursors.spacebar.isDown
       && !gameState.isAiming
       && cooldownReady(gameState.blasterClockSnapshot, gameState.gameClock.now, 500)) {
        let projectile = createProjectile(this);
        if(gameState.player.flipX) {
          projectile.angle = 180;
        }
        else {
          projectile.angle = 0;
        }
        gameState.blasterClockSnapshot = gameState.gameClock.now;
        gameState.projectiles.add(projectile);
        this.sound.play('playerBlasterSound', { volume: 0.25	});
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
        gameState.blasterClockSnapshot = gameState.gameClock.now;
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
  
    //Handles Enemies
      let enemies = gameState.enemies.getChildren();
      updateEnemies(gameState.enemies.getChildren())
      for(let i = 0; i < enemies.length; i++) {
        if(!gameState.blasterArrow) {
          enemies[i].anims.play('skeletonIdle', true);
        }
        else {
          enemies[i].anims.pause();
        }
      }
  }
}