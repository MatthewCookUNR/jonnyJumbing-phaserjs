  /*
  *
  *
  * Main file is used to creating config and Phaser game object
  * 
  * 
  */
const config = {
  type: Phaser.AUTO,
  width: 640,
	height: 640,
	backgroundColor: "ffffff",
	parent: 'phaser-game',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {y: 200},
			enableBody: true,
			debug: false,
		}
	},
  scene:[SceneMain]
}

const gameState = {
	score: 0
}

//Initializing Phaser
const game = new Phaser.Game(config)
