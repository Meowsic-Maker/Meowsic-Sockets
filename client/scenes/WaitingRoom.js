import Phaser from "phaser";
import WebFontFile from "../../public/webfont";

export default class WaitingRoom extends Phaser.Scene {
    constructor() {
        super("WaitingRoom");
        this.state = {};
        this.hasBeenSet = false;
    }

    init(data) {
        //initializing the socket passed to the waiting room
        this.socket = data.socket;
        this.state.loggedInUser = data.user;
    }

    preload() {
        this.load.addFile(new WebFontFile(this.load, 'Gaegu'))
        this.load.html("codeform", "assets/text/codeform.html");
        this.load.image("waitingroom", "/assets/elements/room-code.png");
        this.load.image("getroomcode", "/assets/elements/emptybox.png");
    }

    create() {
        const scene = this;

        scene.popUp = scene.add.graphics();

        // for popup window
        scene.popUp.fillStyle(0xfadfe6, 0.8);
        scene.popUp.fillRect(75, 75, 3258, 1770);

        // for boxes

        this.codeBoxes = this.add
            .image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "waitingroom")
            .setOrigin(0.5, 0.5)

        scene.inputElement = scene.add.dom(320, 420).createFromCache("codeform");
        scene.inputElement.addListener("click");
        scene.inputElement.on("click", function (event) {
            if (event.target.name === "enterRoom") {
                const input = scene.inputElement.getChildByName("code-form");
                scene.socket.emit("isKeyValid", input.value);
            }
        });
        this.getCodeBox = this.add.image(2220, 1140, "getroomcode").setScale(3);
        scene.getCodeBox.setInteractive();
        scene.getCodeBox.on("pointerdown", () => {
            scene.socket.emit("getRoomCode");
        });

        scene.notValidText = scene.add.text(920, 1200, "")
            .setFontSize(80)
            .setFontFamily("Gaegu")
            .setFontStyle("Bold")
            .setColor("#FF10F0")

        scene.socket.on("roomCreated", function (roomKey) {
            scene.roomKey = roomKey;
            // scene.roomKeyText.setText(scene.roomKey);
            let username = "Anonymous";
            if (scene.state.loggedInUser) {
                username = scene.state.loggedInUser.username;
            }
            scene.socket.emit("joinRoom", roomKey, username);
            scene.scene.stop("WaitingRoom");
            scene.scene.stop('MainScene')
            scene.physics.pause();

        });

        scene.socket.on("keyNotValid", function () {
            scene.notValidText.setText("Invalid Room Key");
        });
        scene.socket.on("keyIsValid", function (input) {
            let username = "Anonymous";
            if (scene.state.loggedInUser) {
                username = scene.state.loggedInUser.username;
            }
            scene.socket.emit("joinRoom", input, username);
            scene.scene.stop("WaitingRoom");
            scene.scene.stop("MainScene");
            scene.physics.pause();
        })

        //JOINED ROOM - SET STATE
        scene.socket.on("setState", function (state) {
            console.log("setstate state", state);
            const { roomKey, players, usernames, numPlayers, placedCats } = state;

            scene.state.roomKey = roomKey;
            scene.state.players = players;
            scene.state.usernames = usernames;
            scene.state.numPlayers = numPlayers;
            scene.state.inRoom = true;
            scene.state.placedCats = placedCats;
            scene.scene.start("MeowsicRoom", {
                ...scene.state,
                socket: scene.socket,
                user: scene.state.loggedInUser,
            });
        });
    }
    update() { }
}
