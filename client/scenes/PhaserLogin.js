import Phaser from "phaser";

export default class Login extends Phaser.Scene {
  constructor() {
    super("Login");
    this.state = {
      loggedInUser: null,
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

    // for popup window
    scene.popUp.lineStyle(1, 0xffffff);
    scene.popUp.fillStyle(0xffebf0, 0.9);

    // popup window
    scene.popUp.strokeRect(25, 25, 1086, 590);
    scene.popUp.fillRect(25, 25, 1086, 590);

    //CREATE OUR LOGIN FORM (From html import)
    scene.inputElement = scene.add.dom(568, 320).createFromCache("loginform");
    scene.inputElement.addListener("click");
    scene.inputElement.on("click", function (event) {
      if (event.target.name === "loginButton") {
        //grab our email and password inputs from the login form
        const email = scene.inputElement.getChildByName("email");
        const password = scene.inputElement.getChildByName("password");
        scene.socket.emit("isUserValid", {
          email: email.value,
          password: password.value,
        });
      } else if (event.target.name === "signUpButton") {
        scene.scene.stop("Login");
        scene.scene.start("SignUp", { socket: scene.socket });
      } else if (event.target.name === "cancel") {
        scene.scene.stop("Login");
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

    scene.socket.on("userNotValid", function () {
      scene.notValidText.setText("Invalid Login!");
    });
    scene.socket.on("userLoginSuccess", function (user) {
      scene.scene.stop("Login");
      scene.scene.launch("WaitingRoom", {
        ...scene.state,
        socket: scene.socket,
      });
    });
  }
  update() {}
}
