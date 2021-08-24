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
        this.load.image("bg", "/assets/bg.jpg")
        this.load.image("loginbutton", "/assets/elements/button_login_signUp.png")
        this.load.image("meowsicbutton", "/assets/elements/button_makeMeowsic.png")

    }

    create() {
        //Add the background & fit to game window:
        let image = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "bg"
        );
        let scaleX = this.cameras.main.width / image.width;
        let scaleY = this.cameras.main.height / image.height;
        let scale = Math.max(scaleX, scaleY);
        image.setScale(scale).setScrollFactor(0);

        let scene = this;

        //create socket:
        this.socket = io();

        //BUTTONS!!
        this.meowsicButton = this.add.image(700, 550, 'meowsicbutton').setScale(.8, .8).setInteractive();
        this.meowsicButton.on("pointerdown", function () {
            //LATER CHANGE TO WAITINGROOM SCREEN!!
            scene.scene.launch('MeowsicRoom', { socket: scene.socket })
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
