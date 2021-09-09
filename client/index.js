import 'phaser'
import config from './config/config'
import MainScene from './scenes/MainScene'
import WaitingRoom from './scenes/WaitingRoom'
import MeowsicRoom from './scenes/MeowsicRoom'
import Login from './scenes/PhaserLogin'
import SignUp from './scenes/PhaserSignUp'

class Game extends Phaser.Game {
  constructor() {
    //add the config file to the game
    super(config)
    //add all the scenes
    // <<SCENES GO HERE>>
    this.scene.add('MainScene', MainScene)
    this.scene.add('WaitingRoom', WaitingRoom)
    this.scene.add('MeowsicRoom', MeowsicRoom)
    this.scene.add('Login', Login)
    this.scene.add('SignUp', SignUp)
    //Start the game with the mainscene
    this.scene.start('MainScene')
  }
}

window.onload = function () {
  window.game = new Game();
};


