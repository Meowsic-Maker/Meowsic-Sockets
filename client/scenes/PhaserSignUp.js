import Phaser from "phaser"
import WebFontFile from "../../public/webfont"
export default class SignUp extends Phaser.Scene {
  constructor() {
    super("SignUp")
    this.state = {
      signedUpUser: null,
    }
  }

  init(data) {
    this.socket = data.socket;
    this.state.currentRoom = data.currentRoom
  }

  preload() {
    this.load.addFile(new WebFontFile(this.load, 'Gaegu'))
    this.load.html("signupform", "assets/text/signupform.html");
  }

  create() {
    const scene = this

    // Add & Style popup window
    scene.popUp = scene.add.graphics()
    scene.popUp.lineStyle(1, 0xffffff)
    scene.popUp.fillStyle(0xffebf0, 0.9)
    scene.popUp.strokeRect(75, 75, 3258, 1770)
    scene.popUp.fillRect(75, 75, 3258, 1770)

    // CREATE SIGN UP FORM (from html)
    scene.inputElement = scene.add.dom(this.sys.canvas.width / 2, this.sys.canvas.height / 2).createFromCache("signupform");
    scene.inputElement.addListener("click");
    scene.inputElement.on("click", function (event) {
      if (event.target.name === "signUpButton") {
        //grab our inputs from the signup form
        const username = scene.inputElement.getChildByName("username")
        const email = scene.inputElement.getChildByName("email")
        const password = scene.inputElement.getChildByName("password")
        scene.socket.emit("isSignUpValid", {
          username: username.value,
          email: email.value,
          password: password.value,
        });
      } else if (event.target.name === "cancel") {
        scene.scene.stop("Login")
      }
    });

    //Error Handling:
    this.notValidText = scene.add.text(1000, 1570, "")
      .setFontSize(60)
      .setFontFamily("Gaegu")
      .setFontStyle("Bold")
      .setColor("#FF10F0")
    scene.socket.on("signUpNotValid", function (error) {
      scene.notValidText.setText(`OOPS! ${error}. Try Again!`)
    });

    // if the user is able to successfully sign-up, send them to the waiting room
    scene.socket.on("userSignUpSuccess", function (user) {
      scene.scene.stop("SignUp");
      if (scene.state.currentRoom) {
        // let username = scene.state.loggedInUser.username;
        scene.socket.emit("joinRoom", scene.state.currentRoom, user.username);
        scene.physics.pause();
        scene.scene.stop("MeowsicRoom")
      } else {
        scene.scene.launch("WaitingRoom", {
          ...scene.state,
          socket: scene.socket,
          user: user,
        })
      }
    })
  }
}
