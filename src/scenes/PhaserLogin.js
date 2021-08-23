import Phaser from "phaser";


export default class Login extends Phaser.Scene {
    constructor() {
        super("Login");
        this.state = {
            loggedInUser: null
        };
    }

    init(data) {
        //initializing the socket passed to the waiting room
        this.socket = data.socket;
    }

    preload() {
        this.load.html("loginform", "assets/text/loginform.html");
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

        //CREATE OUR LOGIN FORM (From html import)
        scene.inputElement = scene.add.dom(500, 350).createFromCache("loginform");
        scene.inputElement.addListener("click");
        scene.inputElement.on("click", function (event) {
            if (event.target.name === "loginButton") {
                //grab our username and password inputs from the login form
                const username = scene.inputElement.getChildByName("username");
                const password = scene.inputElement.getChildByName('password')
                scene.socket.emit("isUserValid", { username: username.value, password: password.value });
            }
        });

        // scene.requestButton.setInteractive();
        // scene.requestButton.on("pointerdown", () => {
        //     scene.socket.emit("getRoomCode");
        // });

        scene.notValidText = scene.add.text(670, 295, "", {
            fill: "#ff0000",
            fontSize: "15px",
        });
        scene.roomKeyText = scene.add.text(210, 250, "", {
            fill: "#ffffff",
            fontSize: "20px",
            fontStyle: "bold",
        });

        scene.socket.on("roomCreated", function (roomKey) {
            scene.roomKey = roomKey;
            scene.roomKeyText.setText(scene.roomKey);
        });

        scene.socket.on("keyNotValid", function () {
            scene.notValidText.setText("Invalid Login!");
        });
        scene.socket.on("userLoginSuccess", function (user) {
            scene.setState({ loggedInUser: user })
            scene.scene.stop('Login')
            scene.scene.start("WaitingRoom", { ...scene.state, socket: scene.socket });
        });
    }
    update() { }

}