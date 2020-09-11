const gameState = {
	score: 0
}

function preload () {
	this.load.image('bug1', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_1.png');
	this.load.image('bug2', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_2.png');
	this.load.image('bug3', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_3.png');
	this.load.image('platform', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/platform.png');
	this.load.image('gunArrow', 'assets/Blue/blue_arrow.png');
	this.load.spritesheet('codeyIdle', 'assets/Blue/Gunner_Blue_Idle.png', { frameWidth: 48, frameHeight: 48 });
	this.load.spritesheet('codeyRun', 'assets/Blue/Gunner_Blue_Run.png', { frameWidth: 48, frameHeight: 48 });

}

function create () {
	const platforms = this.physics.add.staticGroup();
 
	platforms.create(320, 350, 'platform').setScale(2, 0.5).refreshBody();

	gameState.scoreText = this.add.text(320, 340, 'Score: 0', { fontSize: '15px', fill: '#000' })
	gameState.clockReady = false;

	gameState.player = this.physics.add.sprite(320, 300, 'codeyIdle').setScale(1);
	
	gameState.player.setCollideWorldBounds(true);

	this.physics.add.collider(gameState.player, platforms)

	gameState.player.angle = 360;

	gameState.projectiles = this.physics.add.group();

	const bugList = ['bug1', 'bug2', 'bug3']

	const bugGen = () => {
		const xCoord = Math.random() * 640
		let randomBug = bugList[Math.floor(Math.random() * 3)]
		bugs.create(xCoord, 10, randomBug)
	}

	/*const bugGenLoop = this.time.addEvent({
		delay: 100,
		callback: bugGen,
		loop: true,
	});*/


	/*this.physics.add.collider(bugs, platforms, function (bug){
		bug.destroy();
		gameState.score += 10;
		gameState.scoreText.setText(`Score: ${gameState.score}`)		
	})

	this.physics.add.collider(gameState.player, bugs, () => {
			bugGenLoop.destroy();
			this.physics.pause();

			this.add.text(280, 150, 'Game Over \n Click to Restart', { fontSize: '15px', fill: '#000' })
			gameState.score = 0

			this.input.on('pointerdown', () => {
				this.scene.restart();
			})
	})*/

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

function update () {
	if(!gameState.clockReady) {
		gameState.gameClock = new Phaser.Time.Clock(this);
		gameState.gameClock = this.time;
		gameState.lastShotTime = gameState.gameClock.now;
		gameState.clockReady = true;
	}

	gameState.gameClock = this.time;
	const cursors = this.input.keyboard.createCursorKeys();
	if(!gameState.isAiming) {
		if(cursors.left.isDown){
			gameState.player.setVelocityX(-200)
			gameState.player.anims.play('run', true);
			gameState.player.flipX = true;
	
		} else if (cursors.right.isDown) {
			gameState.player.setVelocityX(200)
			gameState.player.anims.play('run', true);
			gameState.player.flipX = false;
	
		} else {
			gameState.player.setVelocityX(0);
			gameState.player.anims.play('idle', true);
		}
	}

	if(cursors.space.isDown && !gameState.isAiming) {
		//Press 1: Create Arrow and Aim
		if(cooldownReady(gameState.lastShotTime, gameState.gameClock.now, 2000)) {
				gameState.player.setVelocityX(0);
				gameState.player.anims.pause();
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
			console.log(gameState.gunArrow);
		}
	}


	if(gameState.gunArrow) {
		//Calculates direction pointing from player
		var angleDeg = Math.atan2(gameState.gunArrow.y - gameState.player.y, gameState.gunArrow.x - gameState.player.x) * 180 / Math.PI;
		gameState.gunArrow.angle = angleDeg+180;
		//Left Pointing Arrow
		if(!gameState.player.flipX) {
			if(gameState.gunArrow.reverse) {
				Phaser.Actions.RotateAround([gameState.gunArrow], gameState.player, +0.01);
				if(Math.floor(angleDeg) === 0) {
					gameState.gunArrow.reverse = false;
				}
			}	
			else {
				Phaser.Actions.RotateAround([gameState.gunArrow], gameState.player, -0.01);
				if(Math.ceil(angleDeg) === -90) {
					gameState.gunArrow.reverse = true;
				}
			}
		}
		//Right Pointing Arrow
		else {
			if(gameState.gunArrow.reverse) {
				Phaser.Actions.RotateAround([gameState.gunArrow], gameState.player, -0.01);
				if(Math.floor(angleDeg) === -180) {
					gameState.gunArrow.reverse = false;
				}
			}	
			else {
				Phaser.Actions.RotateAround([gameState.gunArrow], gameState.player, +0.01);
				if(Math.ceil(angleDeg) === -90) {
					gameState.gunArrow.reverse = true;
				}
			}
		}
		if(cooldownReady(gameState.lastShotTime, gameState.gameClock.now, 1000  ) && cursors.space.isDown) {
			let projectile = this.physics.add.sprite(gameState.player.x, gameState.player.y, 'codeyIdle');
			projectile.angle = angleDeg;
			gameState.projectiles.add(projectile);
			gameState.lastShotTime = gameState.gameClock.now;
			gameState.gunArrow.destroy();
			gameState.gunArrow = null;
			gameState.isAiming = false;
		}
	}
	
	if(gameState.projectiles.getChildren().length) {
		let bullets = gameState.projectiles.getChildren();
		for(let i = 0; i < bullets.length; i++) {
			const vec = this.physics.velocityFromAngle(bullets[i].angle, 100)
			bullets[i].setVelocityX(vec.x);
			bullets[i].setVelocityY(vec.y);
		}
	}

}

//Functions returns true if cooldown is ready
function cooldownReady(lastShotTime, currentClock, cooldownTime) {
	console.log("Last shot: " + lastShotTime);
	console.log("Current Clock: " + currentClock);
	console.log("Difference: " + (currentClock - lastShotTime));
	if((currentClock - lastShotTime) < cooldownTime)
	{
		return false;
	}
	else
	 	return true;
}

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

const game = new Phaser.Game(config)
