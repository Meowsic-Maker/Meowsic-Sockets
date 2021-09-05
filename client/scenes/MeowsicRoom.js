import Phaser from "phaser";
import Cat1 from "../helpers/cat1";
import Cat2 from "../helpers/cat2";
import Cat3 from "../helpers/cat3";
import Cat4 from "../helpers/cat4";
import Cat5 from "../helpers/cat5";
import Cat6 from "../helpers/cat6";
import Menu from "../helpers/menu";
import Zone from "../helpers/zone";
import * as Tone from "tone";
import { render } from "react-dom";
import WebFontFile from "../../public/webfont";

export default class MeowsicRoom extends Phaser.Scene {
  constructor() {
    super("MeowsicRoom");
    this.state = { backgroundMusicOn: false };
  }

  preload() {
    this.load.addFile(new WebFontFile(this.load, "Gaegu"));
    this.load.image("bg", "/assets/elements/stagebg.jpg");
    this.load.spritesheet("instructions", "/assets/elements/how-to-play.png", {
      frameWidth: 1200,
      frameHeight: 1200,
    });

    this.load.image("loginButton", "/assets/elements/loginbutton.png");
    this.load.image("homeButton", "/assets/elements/homebutton.png");
    this.load.image("pauseButton", "/assets/elements/pausebutton.png");
    this.load.image("playButton", "/assets/elements/playbutton.png");
    this.load.spritesheet("Cat1", "/assets/cats/cat1-sheet.png", {
      frameWidth: 1200,
      frameHeight: 1200,
    });
    this.load.image("Cat2", "/assets/coffeeneko.png");
    this.load.image("Cat3", "/assets/latteneko.png");
    this.load.spritesheet("Cat4", "/assets/cats/cat4-sheet.png", {
      frameWidth: 1200,
      frameHeight: 1200,
    });
    this.load.spritesheet("Cat5", "/assets/cats/cat5-sheet.png", {
      frameWidth: 1200,
      frameHeight: 1200,
    });
    this.load.image("Cat8", "/assets/kuroneko.png");
    this.load.image("Cat7", "/assets/sleepyneko.png");
    this.load.spritesheet("Cat6", "/assets/cats/cat8-sheet.png", {
      frameWidth: 1200,
      frameHeight: 1200,
    });

    this.load.audio("bossanova", "/assets/music/bossa-nova-bass.wav");
    this.load.audio("bell", "/assets/music/bell.mp3");
    this.load.audio("cat1", "/assets/music/cat1.wav");
    this.load.audio("cat2", "/assets/music/cat2.wav");
    this.load.audio("cat3", "/assets/music/cat3.wav");
    this.load.audio("cat4", "/assets/music/cat4.wav");
    this.load.audio("cat5", "/assets/music/cat5.wav");
    this.load.audio("cat6", "/assets/music/cat6.wav");
    this.load.audio("cat7", "/assets/music/cat7.wav");
    this.load.audio("cat8", "/assets/music/cat8.wav");
  }

  init(data) {
    //initializing the socket passed to the waiting room
    this.socket = data.socket;
    this.state = { ...data };
    this.user = data.user;
    this.state.loggedInUser = data.user;
  }

  create() {
    const scene = this;
    // BACKGROUND
    this.background = this.add
      .image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "bg")
      .setOrigin(0.5, 0.5);
    this.background.displayWidth = this.sys.canvas.width;
    this.background.displayHeight = this.sys.canvas.height;

    // INSTRUCTIONS POP UP
    this.instructions = this.add
      .sprite(
        this.sys.canvas.width / 2,
        this.sys.canvas.height / 2,
        "instructions"
      )
      .setScale(2.7)
      .setInteractive();
    this.instructions.displayWidth = this.sys.canvas.width;
    this.anims.create({
      key: "play",
      repeat: -1,
      frameRate: 7,
      frames: this.anims.generateFrameNames("instructions", {
        start: 0,
        end: 11,
      }),
    });
    // PLAY instructions animation:
    this.instructions.play("play");
    this.instructions.on(
      "pointerdown",
      function (pointer) {
        //renders current room settings once destroyed
        scene.renderCurrentCats();
        scene.renderPlayerUsernames();
        scene.renderButtons();
        scene.renderCatButtons(1, 2, 3, 4, 5, 6);
        this.instructions.destroy();
        let roomKey = scene.state.roomKey;
        this.socket.emit("userConnectedToRoom", { roomKey });
      }.bind(this)
    );

    this.roomKeyText = this.add
      .text(1560, 130, [scene.state.roomKey])
      .setFontSize(80)
      .setFontFamily("Gaegu")
      .setFontStyle("Bold")
      .setColor("navy")
      .setInteractive();

    this.renderButtons = () => {
      //HOME Button
      scene.homeButton = this.add
        .image(1050 * 3, 130, "homeButton")
        .setInteractive()
        .setScale(1.2);
      scene.homeButton.on("pointerdown", function () {
        stopAllCatSounds();
        track.stop().disconnect();
        Tone.Transport.stop();
        scene.scene.start("MainScene", {
          socket: scene.socket,
          user: scene.state.loggedInUser,
        });
      });
      //LOGIN/SIGNUP Button
      if (!scene.state.loggedInUser) {
        scene.loginButton = this.add
          .image(3060, 960, "loginButton")
          .setInteractive()
          .setScale(1.2);
        scene.loginButton.on("pointerdown", function () {
          stopAllCatSounds();
          Tone.Transport.cancel(0);
          Tone.Transport.stop();
          scene.scene.launch("Login", {
            socket: scene.socket,
            currentRoom: scene.state.roomKey,
          });
        });
      }

      //PLAY Button
      scene.togglePlay("pause");
    };

    //TOGGLE Play/pause
    this.togglePlay = (status) => {
      if (status === "play") {
        (scene.pauseButton = this.add
          .image(1020 * 3, 1570, "pauseButton")
          .setInteractive()
          .setScale(1.2)),
          scene.pauseButton.on("pointerdown", function () {
            Tone.Transport.stop();
            this.destroy();
            scene.togglePlay("pause");
          });
      } else {
        (scene.playButton = this.add
          .image(1020 * 3, 1570, "playButton")
          .setInteractive()
          .setScale(1.2)),
          scene.playButton.on("pointerdown", function () {
            Tone.start();
            Tone.Transport.start();
            this.destroy();
            scene.togglePlay("play");
          });
      }
    };

    Tone.Transport.bpm.value = 100;
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = "0";
    Tone.Transport.loopEnd = "6m";

    const track = new Tone.Player({
      url: "/assets/music/bossa-nova-bass.wav",
      volume: -10,
      loop: true,
      autostart: true,
    })
      .toDestination()
      .sync()
      .start(0);

    const bellSound = () => {
      const bell = new Tone.Player("/assets/music/bell.mp3").toDestination();
      bell.autostart = true;
    };

    const getCatSound = () => {
      const audioContext = new AudioContext();
      const osc = audioContext.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = 350;
      osc.frequency.exponentialRampToValueAtTime(
        600,
        audioContext.currentTime + 1
      );
      const gain = audioContext.createGain();
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.9
      );
      osc.start();
      osc.stop(audioContext.currentTime + 1);
      osc.connect(gain).connect(audioContext.destination);
    };

    const stopAllCatSounds = () => {
      scene.currentPlayedCats.getChildren().forEach((cat) => {
        cat.data.values.meowSounds[0].disconnect();
        cat.data.values.meowSounds[0].stop();
      });
    };

    //////HANDLING CAT RENDERING THROUGH SOCKET///////

    //CREATE CURRENT PLAYED CATS GROUP
    this.currentPlayedCats = this.physics.add.group();

    //Create a renderCat function that renders a placed cat:
    this.renderCat = (selectedDropZone, spriteName, x, y) => {
      let playerCat;
      switch (spriteName) {
        case "Cat1":
          playerCat = new Cat1(scene);
          break;
        case "Cat2":
          playerCat = new Cat2(scene);
          break;
        case "Cat3":
          playerCat = new Cat3(scene);
          break;
        case "Cat4":
          playerCat = new Cat4(scene);
          break;
        case "Cat5":
          playerCat = new Cat5(scene);
          break;
        default:
          playerCat = new Cat6(scene);
          break;
      }
      const renderedCat = playerCat.render(x, y, spriteName);
      //Handling the Drop Zones:
      renderedCat.data.values.dropZones.push(selectedDropZone);
      scene[selectedDropZone].data.values.occupied = true;
      // activating cat meow
      renderedCat.data.values.soundOn = true;
      if (renderedCat.data.values.dropZones.length <= 1) {
        renderedCat.data.values.meow();
      }
      // Set destruction button
      renderedCat.on(
        "pointerdown",
        function (pointer) {
          renderedCat.data.values.meowSounds[0].disconnect();
          renderedCat.data.values.meowSounds[0].stop();
          renderedCat.destroy();
          scene[selectedDropZone].data.values.occupied = false;
          scene.socket.emit("catDestroyed", {
            selectedDropZone: selectedDropZone,
            socketId: scene.socket.id,
            roomKey: scene.state.roomKey,
          });
        }.bind(this)
      );
      //Add cat to group:
      this.currentPlayedCats.add(renderedCat);
    };

    //Function that sets the current cats when a user joins an in-prog session:
    this.renderCurrentCats = () => {
      const { players, numPlayers, placedCats, roomKey } = scene.state;
      placedCats.forEach((cat) => {
        scene.renderCat(cat.dropZone, cat.spriteName, cat.x, cat.y);
      });
    };

    //USERNAMES:
    this.currentUsers = this.physics.add.group();

    this.renderPlayerUsernames = () => {
      this.currentUsers.clear(true, true);
      const { players } = scene.state;
      console.log(players);
      let spacing = 0;
      Object.keys(players).forEach((player, idx) => {
        if (idx < 9) {
          let username = this.add
            .text(2900, 325 + spacing * 58, players[player].username)
            .setFontSize(50)
            .setFontFamily("Gaegu")
            .setColor("#ffffff")
            .setInteractive();
          spacing++;
          this.currentUsers.add(username);
        } else if ((idx = 9)) {
          let username = this.add
            .text(2900, 325 + spacing * 58, "...")
            .setFontSize(50)
            .setFontFamily("Gaegu")
            .setColor("#ffffff")
            .setInteractive();
          this.currentUsers.add(username);
        }
      });
    };

    this.socket.on("disconnected", function (args) {
      const { players, numPlayers } = args;
      console.log("args", args);
      scene.state.players = players;
      scene.state.numPlayers = numPlayers;
      console.log(scene.state);
      scene.renderPlayerUsernames();
    });

    this.socket.on("newUserUpdate", function (roomInfo) {
      const { players, usernames, numPlayers } = roomInfo;
      scene.state.players = players;
      scene.state.usernames = usernames;
      scene.state.numPlayers = numPlayers;
      scene.renderPlayerUsernames();
    });

    //Update our page when a cat has been played:
    this.socket.on("catPlayedUpdate", function (args) {
      const { x, y, selectedDropZone, socketId, roomKey, spriteName } = args;
      //check to see if the socket that placed the cat is the socket we are one:
      console.log(scene.state.roomKey);
      if (socketId !== scene.socket.id && roomKey === scene.state.roomKey) {
        //render cats using our function:
        scene.renderCat(selectedDropZone, spriteName, x, y);
      }
    });

    //Update our page when a cat has been destroyed:
    this.socket.on("catDestroyedUpdate", function (args) {
      const { x, y, selectedDropZone, socketId, roomKey, spriteName } = args;
      //check to see if the socket that destroyed cat is our socket:
      if (socketId !== scene.socket.id && roomKey === scene.state.roomKey) {
        //find the cat in group by dropzone & destroy it
        scene.currentPlayedCats.getChildren().forEach((cat) => {
          if (selectedDropZone === cat.data.values.dropZones[0]) {
            cat.data.values.meowSounds[0].disconnect();
            cat.data.values.meowSounds[0].stop();
            scene[selectedDropZone].data.values.occupied = false;
            cat.destroy();
          }
        });
      }
    });

    // render zones
    this.zone1 = new Zone(this);
    this.dropZone1 = this.zone1.renderZone(1710, 1530, 1230, 720);
    this.dropZone1.name = "dropZone1";

    this.zone2 = new Zone(this);
    this.dropZone2 = this.zone2.renderZone(855, 1200, 480, 900);
    this.dropZone2.name = "dropZone2";

    this.zone3 = new Zone(this);
    this.dropZone3 = this.zone3.renderZone(1200, 885, 480, 900);
    this.dropZone3.name = "dropZone3";

    this.zone4 = new Zone(this);
    this.dropZone4 = this.zone4.renderZone(1650, 495, 420, 720);
    this.dropZone4.name = "dropZone4";

    this.zone5 = new Zone(this);
    this.dropZone5 = this.zone5.renderZone(2025, 435, 480, 540);
    this.dropZone5.name = "dropZone5";

    this.zone6 = new Zone(this);
    this.dropZone6 = this.zone6.renderZone(2250, 870, 840, 600);
    this.dropZone6.name = "dropZone6";

    this.zone7 = new Zone(this);
    this.dropZone7 = this.zone7.renderZone(2550, 1230, 750, 480);
    this.dropZone7.name = "dropZone7";

    // render cat menu buttons
    this.renderCatButtons = (a, b, c, d, e, f) => {
      if (a) {
        let playerCat = new Cat1(this);
        playerCat.render(200, 300, "Cat1");
        playerCat.name = "Cat1";
      }

      if (b) {
        let playerCat2 = new Cat2(this);
        playerCat2.render(200, 500, "Cat2");
        playerCat2.name = "Cat2";
      }

      if (c) {
        let playerCat3 = new Cat3(this);
        playerCat3.render(200, 700, "Cat3");
        playerCat3.name = "Cat3";
      }

      if (d) {
        let playerCat4 = new Cat4(this);
        playerCat4.render(200, 900, "Cat4");
        playerCat4.name = "Cat4";
      }

      if (e) {
        let playerCat5 = new Cat5(this);
        playerCat5.render(200, 1100, "Cat5");
        playerCat5.name = "Cat5";
      }

      if (f) {
        let playerCat6 = new Cat6(this);
        playerCat6.render(200, 1300, "Cat6");
        playerCat6.name = "Cat6";
      }
    };

    this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("dragstart", function (pointer, gameObject) {
      getCatSound();
      gameObject.setTint(0xff69b4);
      scene.children.bringToTop(gameObject);
    });

    this.input.on("dragend", function (pointer, gameObject, dropped) {
      gameObject.setTint();
      if (!dropped) {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
    });

    this.input.on("drop", function (pointer, gameObject, dropZone) {
      if (!dropZone.data.values.occupied) {
        // if cat is dropped in an empty zone
        // snap into place
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        //set zone to occupied
        dropZone.data.values.occupied = true;
        // Set destruction button
        gameObject.on(
          "pointerdown",
          function (pointer) {
            gameObject.data.values.meowSounds[0].disconnect();
            gameObject.data.values.meowSounds[0].stop();
            dropZone.data.values.occupied = false;
            gameObject.destroy();
            scene.socket.emit("catDestroyed", {
              selectedDropZone: dropZone.name,
              socketId: scene.socket.id,
              roomKey: scene.state.roomKey,
            });
          }.bind(this)
        );

        // Update dropzone details on cat object
        gameObject.data.values.dropZones.push(dropZone.name);

        // Activate cat and meow
        gameObject.data.values.soundOn = true;
        if (gameObject.data.values.dropZones.length <= 1) {
          gameObject.data.values.meow();
        }

        //respawn button:
        let a, b, c, d, e, f;
        switch (gameObject.data.values.spriteName) {
          case "Cat1":
            a = true;
            break;
          case "Cat2":
            b = true;
            break;
          case "Cat3":
            c = true;
            break;
          case "Cat4":
            d = true;
            break;
          case "Cat5":
            e = true;
            break;
          case "Cat6":
            f = true;
            break;
        }
        scene.renderCatButtons(a, b, c, d, e, f);

        //Add cat to the group:
        scene.currentPlayedCats.add(gameObject);
        gameObject.play(gameObject.data.values.spriteName, true);

        //send a notice to server that a cat has been played
        scene.socket.emit("catPlayed", {
          x: dropZone.x,
          y: dropZone.y,
          selectedDropZone: dropZone.name,
          socketId: scene.socket.id,
          roomKey: scene.state.roomKey,
          spriteName: gameObject.data.values.spriteName,
        });
      } else {
        // if dropped anywhere else, return to start
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
    });
  }

  update() {}
}
