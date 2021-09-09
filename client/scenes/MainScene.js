import Phaser from "phaser";
import io from "socket.io-client";
import WebFontFile from "../../public/webfont";

// updated this filename

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene"),
      (this.state = {
      });
  }

  init(data) {
    //initializing the socket passed to the waiting room
    if (data) this.state.loggedInUser = data.user;
    if (window.localStorage.getItem('user')) this.state.loggedInUser = window.localStorage.getItem('user')
  }

  preload() {
    this.load.addFile(new WebFontFile(this.load, 'Gaegu'))
    this.load.image("loginbutton", "/assets/elements/login-button.png");
    this.load.image("logoutbutton", "/assets/elements/mainpage-logout-button.png");
    this.load.image("loginbuttonhover", "/assets/elements/login-button-hover.png");
    this.load.image("meowsicbutton", "/assets/elements/meowsic-button.png");
    this.load.image("meowsicbuttonhover", "/assets/elements/meowsic-button-hover.png");
    this.load.spritesheet("giflogo", "/assets/meow-logo-spritesheet.png", {
      frameWidth: 1200,
      frameHeight: 1200,
    });
  }

  create() {
    console.log(this.state)
    // could we maybe revert back to this keyword?
    let scene = this;

    // Create Background:
    const background = scene.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "giflogo", 0).setScale(2.9);
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
      .image(2400, 1680, "meowsicbutton")
      .setScale(0.8, 0.8)
      .setInteractive();
    this.meowsicButton.on("pointerdown", function () {
      scene.scene.launch("WaitingRoom", { socket: scene.socket, user: scene.state.loggedInUser });
      scene.meowsicButton.disableInteractive();
      scene.loginButton ? (scene.loginButton.disableInteractive()) : (scene.logoutButton.disableInteractive())
    });
    if (!this.state.loggedInUser) {
      this.loginButton = this.add
        .image(940, 1680, "loginbutton")
        .setScale(0.8, 0.8)
        .setInteractive();
      this.loginButton.on("pointerdown", function () {
        scene.scene.launch("Login", { ...scene.state, socket: scene.socket });
        scene.loginButton.disableInteractive();
        scene.meowsicButton.disableInteractive();
      });
    } else {
      this.logoutButton = this.add
        .image(940, 1680, "logoutbutton")
        .setScale(0.8, 0.8)
        .setInteractive();
      this.logoutButton.on("pointerdown", function () {
        window.localStorage.clear()
        scene.scene.start("MainScene", { user: null });
      })
    }
  }

  update() {
    const scene = this;
  }
}
