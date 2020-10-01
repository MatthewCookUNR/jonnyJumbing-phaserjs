  /*
  *
  *
  * Main file is used to creating config and Phaser game object
  * 
  * 
  */
const config = {
  type: Phaser.AUTO,
  width: 800,
	height: 480,
	backgroundColor: "ffffff",
	parent: 'phaser-game',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {y: 200},
			enableBody: true,
			debug: true,
		}
	},
  scene:[SceneMain]
}

const gameState = {
	score: 0
}

//Initializing Phaser
const game = new Phaser.Game(config)
