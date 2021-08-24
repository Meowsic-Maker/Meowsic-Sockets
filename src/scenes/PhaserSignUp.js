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
  this.load.html("signUpForm", "assets/text/signupform.html");
}

create () {
  const scene = this;
  // should signUp form differ or mirror login?
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

        // CREATE SIGN UP SCENE
        scene.inputElement = scene.add.dom(500, 350).createFromCache("signUpform");
        scene.inputElement.addListener("click");
        scene.inputElement.on("click", function (event) {
            if (event.target.name === "signUpButton") {
                //grab our username and password inputs from the signup form
                const username = scene.inputElement.getChildByName("username");
                const email = scene.inputElement.getChildByName("email");
                const password = scene.inputElement.getChildByName('password')
                scene.socket.emit("isUserValid", { username: username.value, email: email.value, password: password.value });
            }
            // if event matches sign up instead element
            // launch the signUp scene
        });
}
}
