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
  // this.game.stage.createDebugCanvas()

  this.shield = new Kiwi.GameObjects.Sprite(this, this.textures.icons, 200, 200)
  this.shield.cellIndex = 9
  this.shield.y = this.game.stage.height * 0.5 - this.shield.height * 0.5
  this.shield.x = this.game.stage.width * 0.5 - this.shield.width * 0.5

  this.bomb = new Kiwi.GameObjects.Sprite(this, this.textures.icons, 200, 200)
  this.bomb.cellIndex = 0
  this.bomb.y = (this.game.stage.height * 0.5 - this.bomb.height * 0.5) + 200
  this.bomb.x = (this.game.stage.width * 0.5 - this.bomb.width * 0.5) + 200

  this.addChild(this.bomb)
  this.addChild(this.shield)

  this.step = 3

  this.upKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.UP, true)
  this.downKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.DOWN, true)
  this.rightKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.RIGHT, true)
  this.leftKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.LEFT, true)
}

TemplateGame.Play.update = function () {
  Kiwi.State.prototype.update.call(this)

  // Debug - clear canvas from last frame.
  // this.game.stage.clearDebugCanvas()

  // Move the player with the arrow keys.
  if (this.leftKey.isDown) {
    this.shield.x -= this.step
  }
  if (this.rightKey.isDown) {
    this.shield.x += this.step
  }
  if (this.upKey.isDown) {
    this.shield.y -= this.step
  }
  if (this.downKey.isDown) {
    this.shield.y += this.step
  }

  // Check if player is intersecting with ball.
  var overlapped = Kiwi.Geom.Intersect.rectangleToRectangle(this.shield.box.bounds, this.bomb.box.bounds)
  console.log(overlapped.result)

  var playerOffsetX = this.shield.width * 0.5
  var playerOffsetY = this.shield.height * 0.5

  // Set the cameras position to that of the player.
  this.game.cameras.defaultCamera.transform.x = -1 * this.shield.x + this.game.stage.width * 0.5 - playerOffsetX
  this.game.cameras.defaultCamera.transform.y = -1 * this.shield.y + this.game.stage.height * 0.5 - playerOffsetY

  // Debug - draw debug canvas.
  // this.shield.box.draw(this.game.stage.dctx)
  // this.bomb.box.draw(this.game.stage.dctx)
}
