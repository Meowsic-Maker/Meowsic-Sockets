import Phaser from "phaser"

export default class SignUp extends Phaser.Scene {
  constructor() {
    super("SignUp");
    this.state = {
      signedUpUser: null
    };
  }

  init(data) {
    this.socket = data.socket;
  }

  preload() {
    this.load.html("signupform", "assets/text/signupform.html");
  }

  create () {
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
        fontFamily: 'Garamond',
        fontSize: "60px",
        fontStyle: "bold",
    });

    // CREATE SIGN UP FORM (from html)
    scene.inputElement = scene.add.dom(500, 350).createFromCache("signupform");
    scene.inputElement.addListener("click");
    scene.inputElement.on("click", function (event) {
        if (event.target.name === "signUpButton") {
            //grab our username and password inputs from the signup form
            const username = scene.inputElement.getChildByName("username");
            const email = scene.inputElement.getChildByName("email");
            const password = scene.inputElement.getChildByName('password')
            scene.socket.emit("isSignUpValid", { username: username.value, email: email.value, password: password.value });
        }
    });

    scene.notValidText = scene.add.text(670, 295, "", {
      fill: "#ff0000",
      fontSize: "15px"
    });

    scene.socket.on("SignUpNotValid", function () {
      scene.notValidText.setText("Invalid SignUp!");
    });
    // if the user is able to successfully sign-up, send them to the waiting room
    scene.socket.on("userSignUpSuccess", function (user) {
      scene.scene.stop('SignUp')
      scene.scene.launch("WaitingRoom", {...scene.state, socket: scene.socket })
      scene.physics.pause();
    });
  }
}
