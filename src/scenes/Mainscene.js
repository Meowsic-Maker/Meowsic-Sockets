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
        scene.scene.launch('WaitingRoom', { socket: scene.socket })

        //JOINED ROOM - SET STATE
        this.socket.on('setState', function (state) {
            const { roomKey, players, numPlayers } = state
            scene.physics.resume()

            //STATE
            scene.state.roomKey = roomKey
            scene.state.players = players
            scene.state.numPlayers = numPlayers
            scene.state.inRoom = true
        })

        // DISCONNECT
        this.socket.on("disconnected", function (arg) {
            const { playerId, numPlayers } = arg;
            scene.state.numPlayers = numPlayers;
            scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });

    }


    update() {
        const scene = this
    }
}