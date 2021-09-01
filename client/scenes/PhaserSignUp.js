import Phaser from "phaser";

export default class SignUp extends Phaser.Scene {
  constructor() {
    super("SignUp");
    this.state = {
      signedUpUser: null,
    };
  }

  init(data) {
    this.socket = data.socket;
  }

  preload() {
    this.load.html("signupform", "assets/text/signupform.html");
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

    // CREATE SIGN UP FORM (from html)
    scene.inputElement = scene.add.dom(568, 320).createFromCache("signupform");
    scene.inputElement.addListener("click");
    scene.inputElement.on("click", function (event) {
      if (event.target.name === "signUpButton") {
        //grab our email and password inputs from the signup form
        const username = scene.inputElement.getChildByName("username");
        const email = scene.inputElement.getChildByName("email");
        const password = scene.inputElement.getChildByName("password");
        scene.socket.emit("isSignUpValid", {
          username: username.value,
          email: email.value,
          password: password.value,
        });
      } else if (event.target.name === "cancel") {
        scene.scene.stop("Login");
      }
    });

    scene.notValidText = scene.add.text(670, 295, "", {
      fill: "#ff0000",
      fontSize: "15px",
    });

    scene.socket.on("emailNotValid", function () {
      scene.notValidText.setText("Invalid email! OH NOOOOOOOOOOOOOOOO");
  });

    scene.socket.on("SignUpNotValid", function () {
      scene.notValidText.setText("Invalid SignUp!");
    });
    // if the user is able to successfully sign-up, send them to the waiting room
    scene.socket.on("userSignUpSuccess", function (user) {
      scene.scene.stop("SignUp");
      scene.scene.launch("WaitingRoom", {
        ...scene.state,
        socket: scene.socket,
      });
      scene.physics.pause();
    });
  }
}
