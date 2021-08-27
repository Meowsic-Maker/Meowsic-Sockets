import Phaser from "phaser";

export default class WaitingRoom extends Phaser.Scene {
    constructor() {
        super("WaitingRoom");
        this.state = {};
        this.hasBeenSet = false;
    }

    init(data) {
        //initializing the socket passed to the waiting room
        this.socket = data.socket;
        this.state.loggedInUser = data.user
    }

    preload() {
        this.load.html("codeform", "assets/text/codeform.html");
    }

    create() {
        const scene = this;

        scene.popUp = scene.add.graphics();
        scene.boxes = scene.add.graphics();

        // for popup window
        scene.popUp.lineStyle(1, 0xffffff);
        scene.popUp.fillStyle(0xffffff, 0.5);

        // for boxes
        scene.boxes.lineStyle(1, 0xffffff);
        scene.boxes.fillStyle(0xA873D1, 1);

        // popup window
        scene.popUp.strokeRect(50, 50, 900, 550);
        scene.popUp.fillRect(50, 50, 900, 550);

        //title
        scene.title = scene.add.text(100, 75, "Let's Get Meowsical!", {
            fill: 'darkpurple',
            fontSize: "66px",
            fontStyle: "bold",
        });

        //left popup
        scene.boxes.strokeRect(100, 200, 275, 100);
        scene.boxes.fillRect(100, 200, 275, 100);
        scene.requestButton = scene.add.text(140, 215, "Request Room Key", {
            fill: "#000000",
            fontSize: "20px",
            fontStyle: "bold",
        });

        //right popup
        scene.boxes.strokeRect(425, 200, 275, 100);
        scene.boxes.fillRect(425, 200, 275, 100);
        scene.inputElement = scene.add.dom(562.5, 250).createFromCache("codeform");
        scene.inputElement.addListener("click");
        scene.inputElement.on("click", function (event) {
            if (event.target.name === "enterRoom") {
                const input = scene.inputElement.getChildByName("code-form");
                scene.socket.emit("isKeyValid", input.value);
            }
        });

        scene.requestButton.setInteractive();
        scene.requestButton.on("pointerdown", () => {
            scene.socket.emit("getRoomCode");
        });

        scene.notValidText = scene.add.text(670, 295, "", {
            fill: "#ff0000",
            fontSize: "15px",
        });
        scene.roomKeyText = scene.add.text(210, 250, "", {
            fill: "#ffffff",
            fontSize: "20px",
            fontStyle: "bold",
        });

        // scene.socket.on('catPlayed', function (gameObject, dropZone, socketId) {
        //     scene.socket.emit('catPlayed', gameObject, dropZone, socketId);
        // });

        scene.socket.on("roomCreated", function (roomKey) {
            scene.roomKey = roomKey;
            scene.roomKeyText.setText(scene.roomKey);
        });

        scene.socket.on("keyNotValid", function () {
            scene.notValidText.setText("Invalid Room Key");
        });
        scene.socket.on("keyIsValid", function (input) {
            scene.socket.emit("joinRoom", input);
            scene.scene.stop("WaitingRoom");
            scene.scene.stop('MainScene')
            scene.physics.pause();
        });
        //JOINED ROOM - SET STATE
        scene.socket.on("setState", function (state) {
            console.log('are we here yet?')
            const { roomKey, players, numPlayers, placedCats } = state;

            scene.state.roomKey = roomKey;
            scene.state.players = players;
            scene.state.numPlayers = numPlayers;
            scene.state.inRoom = true;
            scene.state.placedCats = placedCats;
            console.log(scene.state)
            scene.scene.start("MeowsicRoom", { ...scene.state, socket: scene.socket });

        })
    }
    update() { }
}
