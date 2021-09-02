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
    this.state.loggedInUser = data.user;
  }

  preload() {
    this.load.html("codeform", "assets/text/codeform.html");
    this.load.image("waitingroom", "/assets/elements/room-code.png");
    this.load.image("getroomcode", "/assets/elements/emptybox.png");
  }

  create() {
    const scene = this;

    scene.popUp = scene.add.graphics();

    console.log(
      "waitingroom scene.state.loggedinuser",
      scene.state.loggedInUser
    );

    // for popup window
    // scene.popUp.lineStyle(1, 0xffffff);
    scene.popUp.fillStyle(0xfadfe6, 0.8);
    // scene.popUp.strokeRect(50, 50, 1036, 540);
    scene.popUp.fillRect(50, 50, 900, 550);

    // for boxes

    this.codeBoxes = this.add
      .image(568, 320, "waitingroom")
      .setOrigin(0.5, 0.5)
      .setScale(0.37);

    // //left popup
    // scene.boxes.strokeRect(100, 200, 275, 100);
    // scene.boxes = scene.add.graphics();
    // scene.boxes.fillStyle(0xA873D1, .3);
    // scene.boxes.fillRect(100, 200, 275, 100);
    // scene.requestButton = scene.add.text(140, 215, "Request Room Key", {
    //     fill: "#000000",

    //     fontSize: "20px",
    //     fontStyle: "bold",
    // });

    //right popup
    // scene.boxes.strokeRect(425, 200, 275, 100);
    // scene.boxes.fillRect(425, 200, 275, 100);

    scene.inputElement = scene.add.dom(320, 420).createFromCache("codeform");
    scene.inputElement.addListener("click");
    scene.inputElement.on("click", function (event) {
      if (event.target.name === "enterRoom") {
        const input = scene.inputElement.getChildByName("code-form");
        scene.socket.emit("isKeyValid", input.value);
      }
    });
    this.getCodeBox = this.add.image(740, 380, "getroomcode");
    scene.getCodeBox.setInteractive();
    scene.getCodeBox.on("pointerdown", () => {
      scene.socket.emit("getRoomCode");
    });

    scene.notValidText = scene.add.text(320, 470, "", {
      fill: "#ff0000",
      fontSize: "15px",
    });
    scene.roomKeyText = scene.add.text(720, 420, "", {
      fill: "#00000",
      fontSize: "50px",
      // fontStyle: "bold",
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
      const username = scene.state.loggedInUser.username;
      scene.socket.emit("joinRoom", input, username);
      scene.scene.stop("WaitingRoom");
      scene.scene.stop("MainScene");
      scene.physics.pause();
    });

    //JOINED ROOM - SET STATE
    scene.socket.on("setState", function (state) {
      console.log("setstate state", state);
      const { roomKey, players, usernames, numPlayers, placedCats } = state;
      //   usernames.push(scene.state.loggedInUser.username);

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
  update() {}
}
