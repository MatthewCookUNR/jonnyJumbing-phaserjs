  /*
  *
  *
  * File is used to store utility functions that are used or can be used
  * for multiple scenes
  * 
  * 
  */
  
  
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
  /*function createCombinedPlatform(platformGroup, platformBuffer, x, y, type, scaleX, scaleY, numberPlatforms) {
    platformBuffer.create(x, y - 35, type).setScale(scaleX, scaleY).refreshBody().setVisible(false);
    for(let i = 1; i < numberPlatforms+1; i++) {
      platformGroup.create(x + i*35, y, type).setScale(scaleX, scaleY).refreshBody();
    }
    platformBuffer.create(x + (numberPlatforms+1)*35, y - 35, type).setScale(scaleX, scaleY).refreshBody().setVisible(false);
  }*/
  
  function placeBlock(scene, pos, key) {
    let block = scene.add.sprite(0,0,key).setScale(0.9);
    gameState.aGrid.placeAtIndex(pos,block);
    gameState.platforms.add(block);
  }

  function placePlatform(scene, pos, key) {
    let block = scene.add.sprite(0,0,key).setScale(4, 0.5);
    gameState.aGrid.placeAtIndex(pos,block);
    gameState.platforms.add(block);
  }

  function placeBlockBuffer(scene, pos, key) {
    let block = scene.add.sprite(0,0,key).setScale(0.5).setVisible(false);
    gameState.aGrid.placeAtIndex(pos,block);
    gameState.platformBuffer.add(block);
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
      projectile.destroy();
      enemy.destroy();
    });
    scene.physics.add.collider(projectile, gameState.platforms, (projectile) => {
      projectile.destroy();
    });
    return projectile;
  }
  
  //Update enemy position
  function updateEnemies(enemyArray) {
    for(let i = 0; i < enemyArray.length; i++) {
      if(enemyArray[i].body.velocity.x > 0 ) {
        enemyArray[i].setVelocityX(25);
      }
      else {
        enemyArray[i].setVelocityX(-25);
      }
    }
  }

  //Generates enemies for level
  function enemyGen (number) {
    for(let i = 0; i < number; i++) {
      const xCoord = this.between(200,640);
      let enemy = gameState.enemies.create(xCoord, -40, 'skeletonIdle')
      .setSize(35, 35, true);
      enemy.flipX = true;
      enemy.setVelocityX(-25);
    }
  }