import Phaser from "phaser";
import Cat from "../helpers/cat";
import Zone from "../helpers/zone";

export default class MeowsicRoom extends Phaser.Scene {
    constructor() {
        super("MeowsicRoom")
        this.state = {}
    }

    preload() {
        this.load.image("cat", "/assets/neko.jpeg");
    }

    init(data) {
        //initializing the socket passed to the waiting room
        this.socket = data.socket;
    }

    create() {
        const scene = this;
        console.log(this)
        let image = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'bg')
        let scaleX = this.cameras.main.width / image.width
        let scaleY = this.cameras.main.height / image.height
        let scale = Math.max(scaleX, scaleY)
        image.setScale(scale).setScrollFactor(0)


        //from this new class, and disable the dealText so that we can't just keep generating cards for no reason.
        this.socket.on('dealCats', function () {
            scene.dealCats();
            scene.dealText.disableInteractive();
        })


        this.socket.on('catPlayed', function (gameObject, selectedDropZone, socketId) {
            //first compares the isPlayerA boolean it receives from the server against the client's own isPlayerA, 
            //which is a check to determine whether the client that is receiving the event is the same one that generated it.
            console.log(scene)
            console.log(selectedDropZone)
            console.log('socketId', socketId)

            if (socketId !== scene.socket.id) {
                let sprite = gameObject.textureKey;
                scene[selectedDropZone].data.values.cats++;
                let playerCat = new Cat(scene);
                playerCat.render((scene.dropZone.x), (scene.dropZone.y), sprite).disableInteractive();
            }
        })

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

        this.dealCatText = this.add
            .text(50, 20, ["DEAL CATS"])
            .setFontSize(18)
            .setFontFamily("Trebuchet MS")
            .setColor("#00ffff")
            .setInteractive();

        this.zone1 = new Zone(this);
        this.dropZone1 = this.zone1.renderZone(600, 480, 210, 360);
        this.outline1 = this.zone1.renderOutline(this.dropZone1);
        this.dropZone1.name = 'dropZone1'

        this.zone2 = new Zone(this);
        this.dropZone2 = this.zone2.renderZone(330, 400, 140, 240);
        this.outline2 = this.zone2.renderOutline(this.dropZone2);
        this.dropZone2.name = 'dropZone2'

        this.zone3 = new Zone(this);
        this.dropZone3 = this.zone3.renderZone(470, 300, 140, 200);
        this.outline3 = this.zone3.renderOutline(this.dropZone3);
        this.dropZone3.name = 'dropZone3'

        this.zone4 = new Zone(this);
        this.dropZone4 = this.zone4.renderZone(610, 200, 140, 200);
        this.outline4 = this.zone4.renderOutline(this.dropZone4);

        this.zone5 = new Zone(this);
        this.dropZone5 = this.zone5.renderZone(740, 150, 120, 180);
        this.outline5 = this.zone5.renderOutline(this.dropZone5);
        this.dropZone5.name = 'dropZone5'

        this.zone6 = new Zone(this);
        this.dropZone6 = this.zone6.renderZone(860, 305, 220, 130);
        this.outline6 = this.zone6.renderOutline(this.dropZone6);

        this.zone7 = new Zone(this);
        this.dropZone7 = this.zone7.renderZone(920, 440, 220, 140);
        this.outline7 = this.zone7.renderOutline(this.dropZone7);

        this.dealCats = () => {
            this.dealCats = () => {
                for (let i = 0; i < 7; i++) {
                    let playerCat = new Cat(this);
                    playerCat.render(80, 100 + i * 100, "cat");
                }
            };
            const meow = () => {
                const audioContext = new AudioContext();
                const osc = audioContext.createOscillator();
                osc.type = "triangle";
                osc.frequency.value = 350;
                osc.frequency.exponentialRampToValueAtTime(
                    600,
                    audioContext.currentTime + 1
                );
                const gain = audioContext.createGain();
                gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    audioContext.currentTime + 0.9
                );

                osc.start();
                osc.stop(audioContext.currentTime + 1);
                osc.connect(gain).connect(audioContext.destination);
            };
            meow();
        };

        this.dealCatText.on("pointerdown", function () {
            scene.dealCats();
        });

        this.dealCatText.on("pointerover", function () {
            scene.dealCatText.setColor("#ff69b4");
        });

        this.dealCatText.on("pointerout", function () {
            scene.dealCatText.setColor("#00ffff");
        });

        this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on("dragstart", function (pointer, gameObject) {
            gameObject.setTint(0xff69b4);
            scene.children.bringToTop(gameObject);
        });

        this.input.on("dragend", function (pointer, gameObject, dropped) {
            gameObject.setTint();
            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        });

        this.input.on("drop", function (pointer, gameObject, dropZone) {
            dropZone.data.values.cats++;
            gameObject.x = dropZone.x;
            gameObject.y = dropZone.y;
            console.log(dropZone)
            scene.socket.emit('catPlayed', gameObject, dropZone, scene.socket.id);
        });
    }

    update() { }
}
