const gameState = {
	score: 0
}

function preload () {
	this.load.image('bug1', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_1.png');
	this.load.image('bug2', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_2.png');
	this.load.image('bug3', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_3.png');
	this.load.image('platform', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/platform.png');
	this.load.image('gunArrow', 'assets/other/blue_arrow.png');
	this.load.image('pinkBeam', 'assets/other/pink_beam.png');
	this.load.audio('playerBlasterSound', 'assets/sounds/player_blaster_sound.mp3');
	this.load.spritesheet('codeyIdle', 'assets/spritesheets/player/Gunner_Blue_Idle.png', { frameWidth: 48, frameHeight: 48 });
	this.load.spritesheet('codeyRun', 'assets//spritesheets/player/Gunner_Blue_Run.png', { frameWidth: 48, frameHeight: 48 });
	this.load.spritesheet('skeletonIdle', 'assets/spritesheets/enemies/skeleton/Idle.png', { frameWidth: 150, frameHeight: 150 })
	this.load.spritesheet('skeletonWalk', 'assets/spritesheets/enemies/skeleton/Walk.png', { frameWidth: 150, frameHeight: 150 })

}

//Initializes player and other objects that are there at start
//of the game
function create () {

	const platforms = this.physics.add.staticGroup();
 
	platforms.create(320, 350, 'platform').setScale(2, 0.5).refreshBody();

	gameState.scoreText = this.add.text(320, 340, 'Score: 0', { fontSize: '15px', fill: '#000' })
	gameState.clockReady = false;

	gameState.player = this.physics.add.sprite(25, 300, 'codeyIdle').setScale(1).setGravityY(150);
	gameState.player.jumbReady = true;
	
	gameState.player.setCollideWorldBounds(true);

	this.physics.add.collider(gameState.player, platforms, function () {
		gameState.player.jumbReady = true;
	});

	gameState.player.angle = 360;

	gameState.projectiles = this.physics.add.group();

	gameState.enemies = this.physics.add.group();


	//Generates enemies for level
	function enemyGen (number) {
		for(let i = 0; i < number; i++) {
			const xCoord = between(200,640);
			gameState.enemies.create(xCoord, -40, 'skeletonIdle')
			.setCollideWorldBounds(true)
			.setSize(50, 50, true);
		}
	}

	enemyGen(5);

	//New Code Character Animations
	this.anims.create({
		key: 'playerIdle',
		frames: this.anims.generateFrameNumbers('codeyIdle', { start: 1, end: 5 }),
		frameRate: 5,
		repeat: -1
	});

	this.anims.create({
		key: 'playerRun',
		frames: this.anims.generateFrameNumbers('codeyRun', { start: 1, end: 5 }),
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
	this.physics.add.collider(gameState.enemies, platforms);

}

//Runs every frame
function update () {

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
		gameState.lastShotTime = gameState.gameClock.now;
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
				if(gameState.gunArrow && !gameState.player.flipX) {
					let flipAngle = flipRotationAlongXAxis(gameState.gunArrow.angle);
					Phaser.Actions.RotateAround([gameState.gunArrow], gameState.player, Phaser.Math.DegToRad(flipAngle));
					gameState.gunArrow.reverse = !gameState.gunArrow.reverse;
				}
				gameState.player.flipX = true;
			} 
			//Press D: move right
			else if (this.cursors.right.isDown) {
				gameState.player.setVelocityX(200)
				if(!gameState.isAiming) {
					gameState.player.anims.play('playerRun', true);
				}
				if(gameState.gunArrow && gameState.player.flipX) {
					let flipAngle = flipRotationAlongXAxis(gameState.gunArrow.angle);
					Phaser.Actions.RotateAround([gameState.gunArrow], gameState.player, Phaser.Math.DegToRad(flipAngle));
					gameState.gunArrow.reverse = !gameState.gunArrow.reverse;
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
	
			//Jumping
			if(this.cursors.up.isDown && gameState.player.jumbReady) {
				gameState.player.jumbReady = false;
				gameState.player.setVelocityY(-200);
			}

	//Press Spacebar: Create Arrow
	if(this.cursors.spacebar.isDown && !gameState.isAiming) {
		if(cooldownReady(gameState.lastShotTime, gameState.gameClock.now, 2000)) {
				gameState.player.setVelocityX(0);
				gameState.player.anims.stop();
				this.physics.pause();
				gameState.isAiming = true;
				if(gameState.player.flipX) {
				gameState.gunArrow = this.add.image(gameState.player.x - 60, gameState.player.y, 'gunArrow').setScale(0.8);
				gameState.gunArrow.reverse = false;
			}
			else {
				gameState.gunArrow = this.add.image(gameState.player.x + 60, gameState.player.y, 'gunArrow').setScale(0.8);
				gameState.gunArrow.reverse = true;
			}
			gameState.lastShotTime = gameState.gameClock.now;
		}
	}


	//Handles gun aiming arrow movement
	if(gameState.gunArrow) {
		//Calculates direction pointing from player
		var angleDeg = Math.atan2(gameState.gunArrow.y - gameState.player.y, gameState.gunArrow.x - gameState.player.x) * 180 / Math.PI;
		gameState.gunArrow.angle = angleDeg+180;
		//Right Pointing Arrow
		if(!gameState.player.flipX) {
			if(gameState.gunArrow.reverse) {
				Phaser.Actions.RotateAroundDistance([gameState.gunArrow], gameState.player, +0.04, 75);
				if(shouldArrowReverse(Math.ceil(angleDeg), Phaser.Math.Angle.WrapDegrees(75))) {
					gameState.gunArrow.reverse = false;
				}
			}	
			else {
				Phaser.Actions.RotateAroundDistance([gameState.gunArrow], gameState.player, -0.04, 75);
				if(shouldArrowReverse(Math.floor(angleDeg), Phaser.Math.Angle.WrapDegrees(-75))) {
					gameState.gunArrow.reverse = true;
				}
			}
		}
		//Left Pointing Arrow
		else {
			if(gameState.gunArrow.reverse) {
				Phaser.Actions.RotateAroundDistance([gameState.gunArrow], gameState.player, +0.04, 75);
				if(shouldArrowReverse(Math.ceil(angleDeg), Phaser.Math.Angle.WrapDegrees(-105))) {
					gameState.gunArrow.reverse = false;
				}
			}	
			else {
				Phaser.Actions.RotateAroundDistance([gameState.gunArrow], gameState.player, -0.04, 75);
				if(shouldArrowReverse(Math.floor(angleDeg), Phaser.Math.Angle.WrapDegrees(105))) {
					gameState.gunArrow.reverse = true;
				}
			}
		}
		//console.log(gameState.gunArrow.angle);


		//Handles if the spacebar is pressed with aiming arrow 
		//which ----> shoots the gun
		if(this.cursors.spacebar.isDown && cooldownReady(gameState.lastShotTime, gameState.gameClock.now, 1000  )) {
			let projectile = this.physics.add.sprite(gameState.player.x, gameState.player.y, 'pinkBeam').setScale(0.7);
			//Colliders
			this.physics.add.collider(projectile, gameState.enemies, (enemy, projectile) => {
				enemy.destroy();
				projectile.destroy();
			});
			projectile.angle = angleDeg;
			gameState.projectiles.add(projectile);
			gameState.lastShotTime = gameState.gameClock.now;
			gameState.gunArrow.destroy();
			gameState.gunArrow = null;
			gameState.isAiming = false;
			this.sound.play('playerBlasterSound');
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
		for(let i = 0; i < enemies.length; i++) {
			enemies[i].setVelocityX(0);
			if(!gameState.gunArrow) {
				enemies[i].anims.play('skeletonIdle', true);
			}
			else {
				enemies[i].anims.pause();
			}
		}
}

//Returns true if angle is within 1 value of confidence
//or equal to the number
function shouldArrowReverse(angleDeg, angleToReverse) {
	if(angleDeg === Phaser.Math.Angle.WrapDegrees(angleToReverse)
		||(angleDeg-1) === Phaser.Math.Angle.WrapDegrees(angleToReverse)
		||(angleDeg+1) === Phaser.Math.Angle.WrapDegrees(angleToReverse))
	{
		return true;
	}
	else {
		return false;
	}
}

//Flips direction of arrow along vertical axis
function flipRotationAlongXAxis(angle) {
	let flippedAngle;
	if(angle > 90 && angle <= 180) {
		flippedAngle = (-2)*Math.abs(angle - 90);
	}
	else if(angle <= 90 && angle >= 0){
		flippedAngle = (2)*Math.abs(angle - 90);
	}
	else if (angle <= -90 && angle > -180) {
		flippedAngle = (2)*Math.abs(90 - angle);

	}
	else {
		flippedAngle = (-2)*Math.abs(-90 - angle);
	}
	//console.log("Angle: " + angle)
	//console.log("Flip: " + flippedAngle);
	return flippedAngle;
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}


//Functions returns true if cooldown is ready
function cooldownReady(lastShotTime, currentClock, cooldownTime) {
	//console.log("Last shot: " + lastShotTime);
	//console.log("Current Clock: " + currentClock);
	//console.log("Difference: " + (currentClock - lastShotTime));
	if((currentClock - lastShotTime) < cooldownTime)
	{
		return false;
	}
	else
	 	return true;
}

//Game Config
const config = {
  type: Phaser.AUTO,
  width: 640,
	height: 360,
	backgroundColor: "ffffff",
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {y: 200},
			enableBody: true,
			debug: true,
		}
	},
  scene: {
		preload,
		create,
		update
	}
}

//Initializing Phaser
const game = new Phaser.Game(config)
