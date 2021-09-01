import Phaser from "phaser";
import io from "socket.io-client";
// updated this filename

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene"),
      (this.state = {
        inRoom: false,
      });
  }

  preload() {
    this.load.image("loginbutton", "/assets/elements/button_login_signUp.png");
    this.load.image("meowsicbutton", "/assets/elements/button_makeMeowsic.png");
    this.load.spritesheet("giflogo", "/assets/meow-logo-spritesheet.png", {
      frameWidth: 1200,
      frameHeight: 1200,
    });
  }

  create() {
    // could we maybe revert back to this keyword?
    let scene = this;

    // Create Background:
    const background = scene.add.sprite(568, 320, "giflogo", 0).setScale(0.95);
    // Create background Animation:
    this.anims.create({
      key: "wiggle",
      repeat: -1,
      frameRate: 5,
      frames: this.anims.generateFrameNames("giflogo", { start: 0, end: 11 }),
    });
    // PLAY background animation:
    background.play("wiggle");

    //create socket:
    this.socket = io();

    //BUTTONS!!
    this.meowsicButton = this.add
      .image(570, 560, "meowsicbutton")
      .setScale(0.8, 0.8)
      .setInteractive();
    this.meowsicButton.on("pointerdown", function () {
      scene.scene.launch("WaitingRoom", { socket: scene.socket });
      scene.meowsicButton.disableInteractive();
      //   scene.loginButton.disableInteractive();
    });
    // this.loginButton = this.add.image(300, 550, 'loginbutton').setScale(.8, .8).setInteractive();
    // this.loginButton.on("pointerdown", function () {
    //     scene.scene.launch('Login', { socket: scene.socket })
    //     scene.loginButton.disableInteractive()
    //     scene.meowsicButton.disableInteractive()
    // })
  }

  update() {
    const scene = this;
  }
}
