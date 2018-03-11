var TemplateGame = TemplateGame || {}
var angle

TemplateGame.Play = new Kiwi.State('Play')

TemplateGame.Play.preload = function () {
  this.addJSON('tilemap', 'tilemap.json')
  this.addSpriteSheet('tiles', 'tileset.png', 32, 32)
  this.addAudio('music', 'throw.mp3')
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
  Kiwi.State.prototype.preload.call(this)
  this.tilemap = new Kiwi.GameObjects.Tilemap.TileMap(this, 'tilemap', this.textures.tiles)
  this.tilemap.scale = 2
  this.SHOT_DELAY = 100 // milliseconds (10 balls/second)
  this.BALL_SPEED = 60 // pixels/second
  this.NUMBER_OF_BALLS = 1
  // this.game.stage.createDebugCanvas()

  // create addAudio
  this.music = new Kiwi.Sound.Audio(this.game, 'music', 1, false)

  this.player = new Kiwi.GameObjects.Sprite(this, this.textures.player, 36, 36)
  this.player.scale = 0.6
  this.player.animation.add('idle', [0], 0.1, true, false)
  this.player.animation.add('rundown', [0, 4, 8, 12], 0.1, true, false)
  this.player.animation.add('runup', [2, 6, 10, 14], 0.1, true, false)
  this.player.animation.add('runleft', [1, 5, 9, 13], 0.1, true, false)
  this.player.animation.add('runright', [3, 7, 11, 15], 0.1, true, false)
  this.player.y = this.game.stage.height * 0.5 - this.player.height * 0.5
  this.player.x = this.game.stage.width * 0.5 - this.player.width * 0.5

  this.player.animation.play('idle')

  for (var i = 0; i < this.tilemap.layers.length; i++) {
    this.addChild(this.tilemap.layers[ i ])
  }

  for (var i = 2; i < this.tilemap.tileTypes.length; i++) {
    this.tilemap.tileTypes[i].allowCollisions = Kiwi.Components.ArcadePhysics.ANY
  }
  this.addChild(this.player)

  const NUMBER_OF_PLAYERS = 5
  this.playerPool = new Kiwi.Group(this)
  this.addChild(this.playerPool)
  for (var i = 0; i < NUMBER_OF_PLAYERS; i++) {
    var npc = new Kiwi.GameObjects.Sprite(this, this.textures.enemy, 36, 36)
    npc.animation.add('run', [2, 6, 10, 14], 0.1, true, false)
    npc.y = -1000
    npc.x = -1000
    this.playerPool.addChild(npc)
    npc.animation.play('run')
  }

  // Set the pivot point to the center of the player
  this.player.anchorPointX = this.player.width * 0.5
  this.player.anchorPointY = this.player.height * 0.5

  this.ballPool = new Kiwi.Group(this)
  this.addChild(this.ballPool)
  for (var i = 0; i < this.NUMBER_OF_BALLS; i++) {
    // Create each ball and add it to the group.
    var ball = new Kiwi.GameObjects.Sprite(this, this.textures.circle, 15, 15)
    this.ballPool.addChild(ball)

    // Set the pivot point to the center of the ball
    ball.anchorPointX = ball.width * 0.5
    ball.anchorPointY = ball.height * 0.5

    // Enable physics on the ball
    ball.physics = ball.components.add(new Kiwi.Components.ArcadePhysics(ball, ball.box))

    // Set its initial state to "dead".
    ball.alive = false
  }

  this.step = 3

  this.upKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.UP, true)
  this.downKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.DOWN, true)
  this.rightKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.RIGHT, true)
  this.leftKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.LEFT, true)
  this.mouse = this.game.input.mouse

  this.player.y += 100 * this.step
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

  this.music.play()

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
  this.centerPoint = new Kiwi.Geom.Point(this.player.x + playerOffsetX, this.player.y + playerOffsetY)
  ball.x = this.centerPoint.x - ballOffsetX
  ball.y = this.centerPoint.y - ballOffsetY

  ball.rotation = angle - Math.PI / 2

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
  }
  return null
}

TemplateGame.Play.revive = function (ball) {
  ball.alive = true
}

TemplateGame.Play.checkBallPosition = function (ball) {
  if (ball.x > this.game.stage.width || ball.x < 0 ||
      ball.y > this.game.stage.height || ball.y < 0) {
    // ball.alive = false
  }

  var oldVelX = ball.physics.velocity.x
  var newVelX = oldVelX - Math.cos(ball.rotation)
  ball.physics.velocity.x = newVelX <= 2 && newVelX >= -2 ? 0 : newVelX

  var oldVelY = ball.physics.velocity.y
  var newVelY = oldVelY - Math.sin(ball.rotation)
  ball.physics.velocity.y = newVelY <= 2 && newVelY >= -2 ? 0 : newVelY
  if (ball.physics.velocity.y === 0 && ball.physics.velocity.x === 0) {
    ball.alive = false
  }
}

TemplateGame.Play.angleToPointer = function () {
  var playerOffsetX = this.player.width * 0.5
  var playerOffsetY = this.player.height * 0.5
  this.mousePoint = new Kiwi.Geom.Point(this.mouse.x, this.mouse.y)
  this.centerPoint = new Kiwi.Geom.Point(
    this.player.x + this.game.cameras.defaultCamera.transform.x + playerOffsetX,
    this.player.y + this.game.cameras.defaultCamera.transform.y + playerOffsetY)
  return this.centerPoint.angleTo(this.mousePoint)
}

TemplateGame.Play.update = function () {
  Kiwi.State.prototype.update.call(this)

  this.player.animation.play('idle')
  // this.checkCollision();

  // Debug - clear canvas from last frame.
  // this.game.stage.clearDebugCanvas()

  // Move the player with the arrow keys.
  if (this.checkCollision(this.leftKey)) {
    this.player.x -= this.step
    this.player.animation.play('runleft')
    if (!this.checkCollision(this.leftKey)) {
      this.player.x += this.step
    }
    key = 0
  }
  if (this.checkCollision(this.rightKey)) {
    this.player.x += this.step
    this.player.animation.play('runright')
    if (!this.checkCollision(this.rightKey)) {
      this.player.x -= this.step
    }
    key = 1
  }
  if (this.checkCollision(this.upKey)) {
    this.player.y -= this.step
    this.player.animation.play('runup')
    if (!this.checkCollision(this.upKey)) {
      this.player.y += this.step
    }
    key = 2
  }
  if (this.checkCollision(this.downKey)) {
    this.player.y += this.step
    this.player.animation.play('rundown')
    if (!this.checkCollision(this.downKey)) {
      this.player.y -= this.step
    }
    key = 3
    playerMoved = true
  }

  if (playerMoved) {
    window.socket.emit('playermove', {
      id: window.socket.id,
      x: this.player.x,
      y: this.player.y,
      rotation: this.player.rotation
    })
    // console.log('OUT:', this.player.x, this.player.y, this.player.rotation)
  }
  angle = this.angleToPointer() + Math.PI / 2

  if (this.game.input.mouse.isDown) {
    this.shootBall()
  }

  var timeOut = false
  var playerIndex = 0
  for (let id in window.players) {
    this.playerPool.members[playerIndex].x = window.players[id].x
    this.playerPool.members[playerIndex].y = window.players[id].y
    this.playerPool.members[playerIndex].rotation = window.players[id].rotation
    playerIndex += 1
  }

  this.ballPool.forEach(this, this.checkBallPosition)

  // Check if player is intersecting with ball.
  var ball = this.getFirstBall(true)
  if (ball !== null) {
    var players = this.playerPool.members

    for (var i = players.length - 1; i >= 0; i--) {
      var overlapped = Kiwi.Geom.Intersect.rectangleToRectangle(ball.box.bounds, players[i].box.bounds)
      if (overlapped.result) {
        console.log('Emitted kill for', Object.keys(window.players)[i])
        window.killed = true
        window.socket.emit('kill', {
          id: Object.keys(window.players)[i]
        })
        this.playerPool.members[i].destroy()
        delete window.players[Object.keys(window.players)[i]]

      }
    }
  }
  if (ball != undefined) {
    if (this.tilemap.layers[2].physics.overlapsTiles(ball, true)
      && Math.abs(ball.physics.velocity.x) > Math.abs(ball.physics.velocity.y)) {
    // ball.physics.velocity.x = 0;
    // ball.physics.velocity.y = 0;
      ball.physics.velocity.y = -ball.physics.velocity.y
    }

    // }
    else if (this.tilemap.layers[2].physics.overlapsTiles(ball, true)
    && Math.abs(ball.physics.velocity.y) > Math.abs(ball.physics.velocity.x)) {
      ball.physics.velocity.x = -ball.physics.velocity.x
    }
  }

  var playerOffsetX = this.player.width * 0.5
  var playerOffsetY = this.player.height * 0.5

  // Set the cameras position to that of the player.
  this.game.cameras.defaultCamera.transform.x = -1 * this.player.x + this.game.stage.width * 0.5 - playerOffsetX
  this.game.cameras.defaultCamera.transform.y = -1 * this.player.y + this.game.stage.height * 0.5 - playerOffsetY

  // Debug - draw debug canvas.
  // this.player.box.draw(this.game.stage.dctx)
}
TemplateGame.Play.checkCollision = function (key) {
  if (this.tilemap.layers[2].physics.overlapsTiles(this.player, true)) {
    return false
  }
  return key.isDown
}
var game = new Kiwi.Game('game-container', 'Play Music', state, gameOptions)
