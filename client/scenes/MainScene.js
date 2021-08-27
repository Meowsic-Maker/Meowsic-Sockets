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
        this.load.image("logo", "/assets/meow-logo.gif")
        this.load.image("loginbutton", "/assets/elements/button_login_signUp.png")
        this.load.image("meowsicbutton", "/assets/elements/button_makeMeowsic.png")
        this.load.spritesheet('giflogo', '/assets/meow-spritesheet.png', { frameWidth: 1200, frameHeight: 1200 })

    }

    create() {
        // could we maybe revert back to this keyword?
        let scene = this;

        // Create Background:
        const background = scene.add.sprite(500, 325, 'giflogo', 0)
        // Create background Animation:
        this.anims.create({
            key: 'wiggle',
            repeat: -1,
            frameRate: 5,
            frames: this.anims.generateFrameNames('giflogo', { start: 0, end: 6 })
        })
        // PLAY background animation:
        background.play('wiggle')

        //create socket:
        this.socket = io();

        //BUTTONS!!
        this.meowsicButton = this.add.image(700, 550, 'meowsicbutton').setScale(.8, .8).setInteractive();
        this.meowsicButton.on("pointerdown", function () {
            //LATER CHANGE TO WAITINGROOM SCREEN!!
            scene.scene.launch('WaitingRoom', { socket: scene.socket })
            scene.meowsicButton.disableInteractive()
            scene.loginButton.disableInteractive()
        })
        this.loginButton = this.add.image(300, 550, 'loginbutton').setScale(.8, .8).setInteractive();
        this.loginButton.on("pointerdown", function () {
            scene.scene.launch('Login', { socket: scene.socket })
            scene.loginButton.disableInteractive()
            scene.meowsicButton.disableInteractive()
        })
    }

    update() {
        const scene = this;
    }
}
