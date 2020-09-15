const gameState = {
	score: 0
}

function preload () {
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
function create () {
	gameState.platforms = this.physics.add.staticGroup();
 
	gameState.platforms.create(320, 350, 'platform').setScale(2, 0.5).refreshBody();
	//Create Scene 1 Platforms
	createCombinedPlatform(gameState.platforms, 125, 280, 'grassTile', 0.8, 0.8, 4);
	createCombinedPlatform(gameState.platforms, 400, 280, 'grassTile', 0.8, 0.8, 4);

	gameState.scoreText = this.add.text(320, 340, 'Score: 0', { fontSize: '15px', fill: '#000' })
	gameState.clockReady = false;

	gameState.player = this.physics.add.sprite(25, 300, 'playerIdle').setScale(1).setSize(35, 35, true).setGravityY(200);
	gameState.player.jumbReady = true;
	
	gameState.player.setCollideWorldBounds(true);

	this.physics.add.collider(gameState.player, gameState.platforms, function () {
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
			.setSize(35, 35, true);
		}
	}

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
			this.sound.play('playerBlasterSound');
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
		//console.log(gameState.blasterArrow.angle);


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
			if(!gameState.blasterArrow) {
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
function cooldownReady(clockSnapshot, currentClock, cooldownTime) {
	//console.log("Last shot: " + clockSnapshot);
	//console.log("Current Clock: " + currentClock);
	//console.log("Difference: " + (currentClock - clockSnapshot));
	if((currentClock - clockSnapshot) < cooldownTime)
	{
		return false;
	}
	else
	 	return true;
}

//Function creates a platform by repeating the tile a given number of times to the right of x,y input
function createCombinedPlatform(platformGroup, x, y, type, scaleX, scaleY, numberPlatforms) {
	for(let i = 0; i < numberPlatforms; i++) {
		platformGroup.create(x + i*35, y, type).setScale(scaleX, scaleY).refreshBody();
	}
}

//Function creates projectile object with given info
//Note: Takes in scene (this) in order to set physics/collider
function createProjectile(scene) {
	let projectile;
	if(gameState.player.flipX) {
		projectile = scene.physics.add.sprite(gameState.player.x - 30, gameState.player.y, 'pinkBeam').setScale(0.7);
	}
	else {
		projectile = scene.physics.add.sprite(gameState.player.x + 30, gameState.player.y, 'pinkBeam').setScale(0.7);
	}
	//Colliders
	scene.physics.add.collider(projectile, gameState.enemies, (enemy, projectile) => {
		enemy.destroy();
		projectile.destroy();
	});
	scene.physics.add.collider(projectile, gameState.platforms, (projectile) => {
		projectile.destroy();
	});
	return projectile;
}

//Game Config
const config = {
  type: Phaser.AUTO,
  width: 640,
	height: 640,
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
