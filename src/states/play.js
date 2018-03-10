var TemplateGame = TemplateGame || {}

TemplateGame.Play = new Kiwi.State('Play')

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
  Kiwi.State.prototype.create.call(this)
  this.SHOT_DELAY = 100 // milliseconds (10 balls/second)
  this.BALL_SPEED = 150 // pixels/second
  this.NUMBER_OF_BALLS = 1
  this.game.stage.createDebugCanvas()

  this.player = new Kiwi.GameObjects.Sprite(this, this.textures.icons, 200, 200)
  this.player.cellIndex = 9
  this.player.y = this.game.stage.height * 0.5 - this.player.height * 0.5
  this.player.x = this.game.stage.width * 0.5 - this.player.width * 0.5
  this.npc = new Kiwi.GameObjects.Sprite(this, this.textures.icons, 200, 200)
  this.npc.cellIndex = 0
  this.npc.y = (this.game.stage.height * 0.5 - this.npc.height * 0.5) + 100
  this.npc.x = (this.game.stage.width * 0.5 - this.npc.width * 0.5) + 100
  this.addChild(this.npc)
  // Set the pivot point to the center of the player
  this.player.anchorPointX = this.player.width * 0.5
  this.player.anchorPointY = this.player.height * 0.5

  this.ballPool = new Kiwi.Group(this)
  this.addChild(this.ballPool)
  for (var i = 0; i < this.NUMBER_OF_BALLS; i++) {
    // Create each ball and add it to the group.
    var ball = new Kiwi.GameObjects.Sprite(this, this.textures.circle, 40, 40)
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
  this.mouse = this.game.input.mouse
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
  var ballOffsetX = ball.width * 0.5
  var ballOffsetY = ball.height * 0.5
  var playerOffsetX = this.player.width * 0.5
  var playerOffsetY = this.player.height * 0.5
  this.centerPoint = new Kiwi.Geom.Point(
    this.player.x + playerOffsetX,
    this.player.y + playerOffsetY )
  ball.x = this.centerPoint.x - ballOffsetX
  ball.y = this.centerPoint.y - ballOffsetY

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

TemplateGame.Play.angleToPointer = function () {
  var playerOffsetX = this.player.width * 0.5
  var playerOffsetY = this.player.height * 0.5
  this.mousePoint = new Kiwi.Geom.Point(this.mouse.x, this.mouse.y)
  this.centerPoint = new Kiwi.Geom.Point(
    this.player.x + this.game.cameras.defaultCamera.transform.x + playerOffsetX,
    this.player.y + this.game.cameras.defaultCamera.transform.y + playerOffsetY, )
  console.log(this.mousePoint.x, this.centerPoint.x)
  console.log(this.mousePoint.y, this.centerPoint.y)
  return this.centerPoint.angleTo(this.mousePoint)
}

TemplateGame.Play.update = function () {
  Kiwi.State.prototype.update.call(this)

  // Debug - clear canvas from last frame.
  this.game.stage.clearDebugCanvas()

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
  this.player.rotation = this.angleToPointer()

  if (this.game.input.mouse.isDown) {
    this.shootBall()
  }

  this.ballPool.forEach(this, this.checkBallPosition)

  // Check if player is intersecting with ball.
  var ball = this.getFirstBall(true)
  if (ball !== null && this.npc.exists) {
      var overlapped = Kiwi.Geom.Intersect.rectangleToRectangle(ball.box.bounds, this.npc.box.bounds)
      console.log(overlapped.result)
      if (overlapped) {
        this.npc.destroy()
      } else {
        console.log(ball.x)
      }
  }

  var playerOffsetX = this.player.width * 0.5
  var playerOffsetY = this.player.height * 0.5

  // Set the cameras position to that of the player.
  this.game.cameras.defaultCamera.transform.x = -1 * this.player.x + this.game.stage.width * 0.5 - playerOffsetX
  this.game.cameras.defaultCamera.transform.y = -1 * this.player.y + this.game.stage.height * 0.5 - playerOffsetY

  // Debug - draw debug canvas.
  this.player.box.draw(this.game.stage.dctx)
}
