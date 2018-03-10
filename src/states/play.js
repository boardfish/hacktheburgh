var TemplateGame = TemplateGame || {}

TemplateGame.Play = new Kiwi.State('Play')

TemplateGame.Play.preload = function() {
	this.addJSON('tilemap', 'tilemap.json');
	this.addSpriteSheet('tiles', 'tileset.png', 32, 32);
}


/**
* The PlayState in the core state that is used in the game.
*
* It is the state where majority of the functionality occurs 'in-game' occurs.
*/

/**
* This create method is executed when a Kiwi state has finished loading
* any resources that were required to load.
*/
TemplateGame.Play.create = function () {
  Kiwi.State.prototype.preload.call(this);
  this.tilemap = new Kiwi.GameObjects.Tilemap.TileMap(this, 'tilemap', this.textures.tiles);

	this.addChild(this.tilemap.layers[0]);
	this.addChild(this.tilemap.layers[1]);

  this.SHOT_DELAY = 100 // milliseconds (10 balls/second)
  this.BALL_SPEED = 150 // pixels/second
  this.NUMBER_OF_BALLS = 1
  // this.game.stage.createDebugCanvas()

  this.player = new Kiwi.GameObjects.Sprite(this, this.textures.icons, 200, 200)
  this.player.cellIndex = 9
  this.player.y = this.game.stage.height * 0.5 - this.player.height * 0.5
  this.player.x = this.game.stage.width * 0.5 - this.player.width * 0.5
  // Set the pivot point to the center of the player
  this.player.anchorPointX = this.player.width * 0.5
  this.player.anchorPointY = this.player.height * 0.5

  this.ballPool = new Kiwi.Group(this)
  this.addChild(this.ballPool)
  for (var i = 0; i < this.NUMBER_OF_BALLS; i++) {
    // Create each ball and add it to the group.
    var ball = new Kiwi.GameObjects.Sprite(this, this.textures.circle, -100, -100)
    this.ballPool.addChild(ball)

    // Set the pivot point to the center of the ball
    ball.anchorPointX = this.player.width * 0.5
    ball.anchorPointY = this.player.height * 0.5

    // Enable physics on the ball
    ball.physics = ball.components.add(new Kiwi.Components.ArcadePhysics(ball, ball.box))

    // Set its initial state to "dead".
    ball.alive = false
  }
  this.addChild(this.player)

  this.step = 3

  this.upKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.UP, true)
  this.downKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.DOWN, true)
  this.rightKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.RIGHT, true)
  this.leftKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.LEFT, true)
}

TemplateGame.Play.shootBall = function () {
    // Enforce a short delay between shots by recording
    // the time that each ball is shot and testing if
    // the amount of time since the last shot is more than
    // the required delay.
  if (this.lastBallShotAt === undefined) this.lastBallShotAt = 0
  if (this.game.time.now() - this.lastBallShotAt < this.SHOT_DELAY) return
  this.lastBallShotAt = this.game.time.now()

    // Get a dead ball from the pool
  var ball = this.getFirstBall(false)

    // If there aren't any balls available then don't shoot
  if (ball === null || ball === undefined) return

    // Revive the ball
    // This makes the ball "alive"
  this.revive(ball)

    // Set the ball position to the player position.
  ball.x = this.player.x
  ball.y = this.player.y

  ball.rotation = this.player.rotation

    // Shoot it in the right direction
  ball.physics.velocity.x = Math.cos(ball.rotation) * this.BALL_SPEED
  ball.physics.velocity.y = Math.sin(ball.rotation) * this.BALL_SPEED
}

TemplateGame.Play.getFirstBall = function (alive) {
  var balls = this.ballPool.members

  for (var i = balls.length - 1; i >= 0; i--) {
    if (balls[i].alive === alive) {
      return balls[i]
    }
  };
  return null
}

TemplateGame.Play.revive = function (ball) {
  ball.alive = true
}
TemplateGame.Play.checkBallPosition = function (ball) {
  if (ball.x > this.game.stage.width || ball.x < 0 ||
        ball.y > this.game.stage.height || ball.y < 0) {
    ball.alive = false
  }
}

TemplateGame.Play.angleToPointer = function ( from ) {
    return Math.atan2( this.game.input.y - from.y, this.game.input.x - from.x );
}

TemplateGame.Play.update = function () {
  Kiwi.State.prototype.update.call(this)

  // Debug - clear canvas from last frame.
  //this.game.stage.clearDebugCanvas()

  // Move the player with the arrow keys.
  if (this.leftKey.isDown) {
    this.player.x -= this.step
  }
  if (this.rightKey.isDown) {
    this.player.x += this.step
  }
  if (this.upKey.isDown) {
    this.player.y -= this.step
  }
  if (this.downKey.isDown) {
    this.player.y += this.step
  }
  this.player.rotation = this.angleToPointer(this.player)

  if (this.game.input.mouse.isDown) {
    this.shootBall()
  }

  this.ballPool.forEach(this, this.checkBallPosition)

  // Check if player is intersecting with ball.
  var ball = this.getFirstBall(true)
  if (ball) {
    var overlapped = Kiwi.Geom.Intersect.rectangleToRectangle(ball.box.bounds, this.player.box.bounds)
    console.log(overlapped.result)
  }

  var playerOffsetX = this.player.width * 0.5
  var playerOffsetY = this.player.height * 0.5

  // Set the cameras position to that of the player.
  this.game.cameras.defaultCamera.transform.x = -1 * this.player.x + this.game.stage.width * 0.5 - playerOffsetX
  this.game.cameras.defaultCamera.transform.y = -1 * this.player.y + this.game.stage.height * 0.5 - playerOffsetY

  // Debug - draw debug canvas.
  // this.player.box.draw(this.game.stage.dctx)
}

var game = new Kiwi.Game(null, 'New Tilemap Game', TemplateGame.Play);
