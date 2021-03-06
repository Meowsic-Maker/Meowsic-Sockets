import Phaser from "phaser";
import Cat from "../helpers/cat";
import Zone from "../helpers/zone";
import * as Tone from "tone";
import WebFontFile from "../../public/webfont";

export default class MeowsicRoom extends Phaser.Scene {
  constructor() {
    super("MeowsicRoom");
    this.state = { backgroundMusicOn: false };
  }

  preload() {
    this.load.addFile(new WebFontFile(this.load, "Gaegu"));
    this.load.image("bg", "/assets/elements/stagebg.jpg");
    this.load.image("loginButton", "/assets/elements/loginbutton.png");
    this.load.image("logoutButton", "/assets/elements/meowsiclogout-button.png");
    this.load.image("homeButton", "/assets/elements/homebutton.png");
    this.load.image("pauseButton", "/assets/elements/pausebutton.png");
    this.load.image("playButton", "/assets/elements/playbutton.png");

    this.load.spritesheet("instructions", "/assets/elements/how-to-play.png", {
      frameWidth: 1200,
      frameHeight: 1200,
    });
    this.load.spritesheet("Cat1", "/assets/cats/cat1-sheet.png", {
      frameWidth: 500,
      frameHeight: 500,
    });
    this.load.spritesheet("Cat2", "/assets/cats/cat2-sheet.png", {
      frameWidth: 500,
      frameHeight: 500,
    });
    this.load.spritesheet("Cat3", "/assets/cats/cat3-sheet.png", {
      frameWidth: 500,
      frameHeight: 500,
    });
    this.load.spritesheet("Cat4", "/assets/cats/cat4-sheet.png", {
      frameWidth: 500,
      frameHeight: 500,
    });
    this.load.spritesheet("Cat5", "/assets/cats/cat5-sheet.png", {
      frameWidth: 500,
      frameHeight: 500,
    });
    this.load.spritesheet("Cat6", "/assets/cats/cat6-sheet.png", {
      frameWidth: 500,
      frameHeight: 500,
    });
    this.load.spritesheet("Cat7", "/assets/cats/cat7-sheet.png", {
      frameWidth: 500,
      frameHeight: 500,
    });
    this.load.spritesheet("Cat8", "/assets/cats/cat8-sheet.png", {
      frameWidth: 500,
      frameHeight: 500,
    });
    this.load.spritesheet("Cat12", "/assets/cats/cat12-sheet.png", {
      frameWidth: 500,
      frameHeight: 500,
    });
    this.load.spritesheet("Cat10", "/assets/cats/cat10-sheet.png", {
      frameWidth: 500,
      frameHeight: 500,
    });

    this.load.audio("bossanova", "/assets/music/bossa-nova-bass.wav");
    this.load.audio("Cat1", "/assets/music/Cat1.wav");
    this.load.audio("Cat2", "/assets/music/Cat2.wav");
    this.load.audio("Cat3", "/assets/music/Cat3.wav");
    this.load.audio("Cat4", "/assets/music/Cat4.wav");
    this.load.audio("Cat5", "/assets/music/Cat5.wav");
    this.load.audio("Cat6", "/assets/music/Cat6.wav");
    this.load.audio("Cat7", "/assets/music/Cat7.wav");
    this.load.audio("Cat8", "/assets/music/Cat8.wav");
    this.load.audio("Cat10", "/assets/music/Cat10.wav");
    this.load.audio("Cat12", "/assets/music/Cat12.wav");
  }

  init(data) {
    //initializing the socket passed to the waiting room
    this.socket = data.socket;
    this.state = { ...data };
    this.user = data.user;
    if (data.user) this.state.loggedInUser = data.user;
    if (data.loggedInUser) this.state.loggedInUser = data.loggedInUser
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
        scene.renderCatButtons(catSpritesArray);
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
      } else {
        scene.logoutButton = this.add
          .image(3060, 960, "logoutButton")
          .setInteractive()
          .setScale(1.2);
        scene.logoutButton.on("pointerdown", function () {
          window.localStorage.clear()
          stopAllCatSounds();
          Tone.Transport.cancel(0);
          Tone.Transport.stop();
          console.log(scene.state)
          scene.socket.disconnect()
          scene.scene.start("MainScene", {
            user: null,
            loggedInUser: null
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
      let playerCat = new Cat(scene, spriteName);
      const renderedCat = playerCat.render(x, y, spriteName);
      //Handling the Drop Zones:
      renderedCat.data.values.dropZones.push(selectedDropZone);
      scene[selectedDropZone].data.values.occupied = true;
      // activating cat meow and dance
      renderedCat.data.values.soundOn = true;
      if (renderedCat.data.values.dropZones.length <= 1) {
        renderedCat.data.values.meow();
      }
      renderedCat.setScale(0.85);
      renderedCat.play(spriteName, true);
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
      const { placedCats } = scene.state;
      placedCats.forEach((cat) => {
        scene.renderCat(cat.dropZone, cat.spriteName, cat.x, cat.y);
      });
    };

    //Render the Meowstros
    this.currentUsers = this.physics.add.group();

    this.renderPlayerUsernames = () => {
      this.currentUsers.clear(true, true);
      const { players } = scene.state;
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
      scene.state.players = players;
      scene.state.numPlayers = numPlayers;
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
      const { x, y, selectedDropZone, socketId, spriteName } = args;
      //check to see if the socket that placed the cat is the socket we are one:
      if (socketId !== scene.socket.id) {
        scene.renderCat(selectedDropZone, spriteName, x, y);
      }
    });

    //Update our page when a cat has been destroyed:
    this.socket.on("catDestroyedUpdate", function (args) {
      const { selectedDropZone, socketId } = args;
      //check to see if the socket that destroyed cat is our socket:
      if (socketId !== scene.socket.id) {
        //find the cat in group by dropzone & DESTROY it
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

    // render drop zones
    this.zoneLocations = [
      [1710, 1530, 1230, 720],
      [855, 1200, 480, 900],
      [1200, 885, 480, 900],
      [1650, 495, 420, 720],
      [2025, 435, 480, 540],
      [2250, 870, 840, 600],
      [2550, 1230, 750, 480]
    ]

    this.zoneLocations.forEach((zone, idx) => {
      let newZone = new Zone(this);
      scene[`dropZone${idx}`] = newZone.renderZone(...zone);
      scene[`dropZone${idx}`].name = `dropZone${idx}`;
    })

    // render cat menu buttons
    let catSpritesArray = [
      { spriteName: "Cat1", x: 170, y: 540 },
      { spriteName: "Cat2", x: 170, y: 780 },
      { spriteName: "Cat3", x: 170, y: 1020 },
      { spriteName: "Cat4", x: 170, y: 1260 },
      { spriteName: "Cat5", x: 170, y: 1500 },
      { spriteName: "Cat6", x: 360, y: 630 },
      { spriteName: "Cat7", x: 360, y: 870 },
      { spriteName: "Cat8", x: 360, y: 1110 },
      { spriteName: "Cat10", x: 360, y: 1350 },
      { spriteName: "Cat12", x: 360, y: 1590 },
    ];

    this.renderCatButtons = (arrayOfSpriteObjs) => {
      arrayOfSpriteObjs.forEach((sprite) => {
        let playerCat = new Cat(this, sprite.spriteName);
        playerCat.render(sprite.x, sprite.y, sprite.spriteName);
      });
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
        // if cat is dropped in an empty zone, snap it into place
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        // Det zone to occupied
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
        gameObject.setScale(0.85);

        // Update dropzone details on cat object
        gameObject.data.values.dropZones.push(dropZone.name);

        // Activate cat and meow
        gameObject.data.values.soundOn = true;
        if (gameObject.data.values.dropZones.length <= 1) {
          gameObject.data.values.meow();
        }

        //respawn button:
        scene.renderCatButtons([
          {
            spriteName: gameObject.data.values.spriteName,
            x: gameObject.input.dragStartX,
            y: gameObject.input.dragStartY,
          },
        ]);

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
}
