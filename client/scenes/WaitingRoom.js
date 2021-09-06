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
        this.load.image("getroomcode", "/assets/elements/new-room-button.png");
    }

    create() {
        const scene = this;

        scene.popUp = scene.add.graphics();

        // for popup window
        scene.popUp.fillStyle(0xfadfe6, 0.8);
        scene.popUp.fillRect(75, 75, 3258, 1770);

        // for boxes

        this.codeBoxes = this.add
            .image(1704, 900, "waitingroom")
            .setOrigin(0.5, 0.5)
            .setScale(1.1)

        const checkRoomKey = () => {
            const input = scene.inputElement.getChildByName("code-form");
            scene.socket.emit("isKeyValid", input.value);
        }

        scene.inputElement = scene.add.dom(1710, 1440).createFromCache("codeform");
        scene.inputElement.addListener("click");
        scene.inputElement.addListener("keyup");
        scene.inputElement.on("keyup", function (event) {
            if (event.keyCode === 13) {
                // if enter key
                checkRoomKey();
            };
        })
        scene.inputElement.on("click", function (event) {
            if (event.target.name === "enterRoom") {
                checkRoomKey();
            }
        });
        this.getCodeBox = this.add.image(this.sys.canvas.width / 2, 870, "getroomcode").setScale(1);
        scene.getCodeBox.setInteractive();
        scene.getCodeBox.on("pointerdown", () => {
            scene.socket.emit("getRoomCode");
        });

        scene.notValidText = scene.add.text(1500, 1570, "")
            .setFontSize(60)
            .setFontFamily("Gaegu")
            .setFontStyle("Bold")
            .setColor("#FF10F0")

        scene.socket.on("roomCreated", function (roomKey) {
            scene.roomKey = roomKey;
            // scene.roomKeyText.setText(scene.roomKey);
            let username = "Anony-mouse";
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
            let username = "Anony-mouse";
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
            const { roomKey, players, usernames, numPlayers, placedCats, loggedInUser } = state;

            scene.state.roomKey = roomKey;
            scene.state.players = players;
            scene.state.usernames = usernames;
            scene.state.numPlayers = numPlayers;
            scene.state.inRoom = true;
            scene.state.placedCats = placedCats;
            if (loggedInUser) scene.state.loggedInUser = loggedInUser
            scene.scene.start("MeowsicRoom", {
                ...scene.state,
                socket: scene.socket,
                user: scene.state.loggedInUser,
            });
        });
    }
    update() { }
}
