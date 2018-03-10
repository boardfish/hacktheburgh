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

  /*
  * Replace with your own game creation code here...
  */
  this.shield = new Kiwi.GameObjects.Sprite(
    this, this.textures.icons, 200, 200)
  this.shield.cellIndex = 9
  this.shield.y = this.game.stage.height * 0.5 - this.shield.height * 0.5
  this.shield.x = this.game.stage.width * 0.5 - this.shield.width * 0.5

  this.background = new Kiwi.GameObjects.StaticImage(this, this.textures.grid, 0, 0)
  this.addChild(this.background)

  this.step = 3

  this.upKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.UP, true)
  this.downKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.DOWN, true)
  this.rightKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.RIGHT, true)
  this.leftKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.LEFT, true)

  // Add the GameObjects to the stage
  this.addChild(this.shield)
  // Debug object - static second shield
  this.shield2 = new Kiwi.GameObjects.Sprite(
    this, this.textures.icons, 200, 200)
  this.shield2.cellIndex = 9
  this.shield2.y = (this.game.stage.height * 0.5 - this.shield.height * 0.5) + 5
  this.shield2.x = (this.game.stage.width * 0.5 - this.shield.width * 0.5) + 5
  this.addChild(this.shield2)
}

TemplateGame.Play.update = function () {
  Kiwi.State.prototype.update.call(this)

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

  var playerOffsetX = this.shield.width * 0.5
  var playerOffsetY = this.shield.height * 0.5

  // Set the cameras position to that of the player.
  this.game.cameras.defaultCamera.transform.x = -1 * this.shield.x + this.game.stage.width * 0.5 - playerOffsetX
  this.game.cameras.defaultCamera.transform.y = -1 * this.shield.y + this.game.stage.height * 0.5 - playerOffsetY
}
