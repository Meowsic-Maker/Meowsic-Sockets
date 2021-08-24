import Phaser from 'phaser'
import io from 'socket.io-client';



export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene'),
            this.state = {
                inRoom: false
            };

    }

    preload() {
        this.load.image("bg", "/assets/bg.jpg")
    }

    create() {
        //Add the background & fit to game window:
        let image = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'bg')
        let scaleX = this.cameras.main.width / image.width
        let scaleY = this.cameras.main.height / image.height
        let scale = Math.max(scaleX, scaleY)
        image.setScale(scale).setScrollFactor(0)

        let scene = this;

        //create socket:
        this.socket = io()

        //LAUNCH WAITING ROOM:
        scene.scene.launch('Login', { socket: scene.socket })

    }


    update() {
        const scene = this
    }
}
