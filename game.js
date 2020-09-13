const gameState = {
	score: 0
}

function preload () {
	this.load.image('bug1', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_1.png');
	this.load.image('bug2', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_2.png');
	this.load.image('bug3', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_3.png');
	this.load.image('platform', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/platform.png');
	this.load.image('gunArrow', 'assets/Blue/blue_arrow.png', { frameWidth: 10, frameHeight: 10 });
	this.load.image('pinkBeam', 'assets/Blue/pink_beam.png');
	this.load.audio('playerBlasterSound', 'assets/Blue/player_blaster_sound.mp3');
	this.load.spritesheet('codeyIdle', 'assets/Blue/Gunner_Blue_Idle.png', { frameWidth: 48, frameHeight: 48 });
	this.load.spritesheet('codeyRun', 'assets/Blue/Gunner_Blue_Run.png', { frameWidth: 48, frameHeight: 48 });

}

//Initializes player and other objects that are there at start
//of the game
function create () {

	const platforms = this.physics.add.staticGroup();
 
	platforms.create(320, 350, 'platform').setScale(2, 0.5).refreshBody();

	gameState.scoreText = this.add.text(320, 340, 'Score: 0', { fontSize: '15px', fill: '#000' })
	gameState.clockReady = false;

	gameState.player = this.physics.add.sprite(320, 300, 'codeyIdle').setScale(1);
	gameState.player.jumbReady = true;
	
	gameState.player.setCollideWorldBounds(true);

	this.physics.add.collider(gameState.player, platforms, function () {
		gameState.player.jumbReady = true;
	});

	gameState.player.angle = 360;

	gameState.projectiles = this.physics.add.group();

	//New Code Character Animations
	this.anims.create({
		key: 'idle',
		frames: this.anims.generateFrameNumbers('codeyIdle', { start: 1, end: 5 }),
		frameRate: 5,
		repeat: -1
	});

	this.anims.create({
		key: 'run',
		frames: this.anims.generateFrameNumbers('codeyRun', { start: 1, end: 5 }),
		frameRate: 5,
		repeat: -1
	});

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
	if(!gameState.isAiming) {
		//Press A: move left
		if(this.cursors.left.isDown){
			gameState.player.setVelocityX(-200)
			gameState.player.anims.play('run', true);
			gameState.player.flipX = true;
	
		} 
		//Press D: move right
		else if (this.cursors.right.isDown) {
			gameState.player.setVelocityX(200)
			gameState.player.anims.play('run', true);
			gameState.player.flipX = false;
	
		}
		//Else idle and stop moving horizontally
		else {
			gameState.player.setVelocityX(0);
			gameState.player.anims.play('idle', true);
		}

		//Jumping
		if(this.cursors.up.isDown && gameState.player.jumbReady) {
			gameState.player.jumbReady = false;
			gameState.player.setVelocityY(-200);
		}
	}

	//Press Spacebar: Create Arrow
	if(this.cursors.spacebar.isDown && !gameState.isAiming) {
		if(cooldownReady(gameState.lastShotTime, gameState.gameClock.now, 2000)) {
				gameState.player.setVelocityX(0);
				gameState.player.anims.pause();
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
				Phaser.Actions.RotateAround([gameState.gunArrow], gameState.player, +0.04);
				if(shouldArrowReverse(Math.ceil(angleDeg), Phaser.Math.Angle.WrapDegrees(75))) {
					gameState.gunArrow.reverse = false;
				}
			}	
			else {
				Phaser.Actions.RotateAround([gameState.gunArrow], gameState.player, -0.04);
				if(shouldArrowReverse(Math.floor(angleDeg), Phaser.Math.Angle.WrapDegrees(-90))) {
					gameState.gunArrow.reverse = true;
				}
			}
		}
		//Left Pointing Arrow
		else {
			if(gameState.gunArrow.reverse) {
				Phaser.Actions.RotateAround([gameState.gunArrow], gameState.player, +0.04);
				if(shouldArrowReverse(Math.ceil(angleDeg), Phaser.Math.Angle.WrapDegrees(-90))) {
					gameState.gunArrow.reverse = false;
				}
			}	
			else {
				Phaser.Actions.RotateAround([gameState.gunArrow], gameState.player, -0.04);
				if(shouldArrowReverse(Math.floor(angleDeg), Phaser.Math.Angle.WrapDegrees(105))) {
					gameState.gunArrow.reverse = true;
				}
			}
		}

		//Handles if the spacebar is pressed with aiming arrow 
		//which ----> shoots the gun
		if(this.cursors.spacebar.isDown && cooldownReady(gameState.lastShotTime, gameState.gameClock.now, 1000  )) {
			let projectile = this.physics.add.sprite(gameState.player.x, gameState.player.y, 'pinkBeam').setScale(0.7);
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
			debug: false,
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
