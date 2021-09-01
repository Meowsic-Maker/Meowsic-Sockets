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

export default class MeowsicRoom extends Phaser.Scene {
  constructor() {
    super("MeowsicRoom");
    this.state = {};
  }

  preload() {
    this.load.image("bg", "/assets/stagebg.jpg");
    this.load.spritesheet("instructions", "/assets/elements/how-to-play.png", { frameWidth: 1200, frameHeight: 1200 });
    this.load.image("Cat1", "/assets/happyneko.png");
    this.load.image("Cat2", "/assets/coffeeneko.png");
    this.load.image("Cat3", "/assets/latteneko.png");
    this.load.image("Cat4", "/assets/caliconeko.png");
    this.load.image("Cat5", "/assets/greyneko.png");
    this.load.image("Cat6", "/assets/kuroneko.png");
    this.load.image("Cat7", "/assets/sleepyneko.png");
    this.load.image("Cat8", "/assets/neko.png");

    this.load.audio("bossanova", "/assets/music/bossa-nova-bass.wav");
    this.load.audio("meow", "/assets/music/meow.mp3");
    this.load.audio("bell", "/assets/music/bell.mp3");
    this.load.audio("cat1", "/assets/music/cat1.wav");
    this.load.audio("cat2", "/assets/music/cat2.wav");
    this.load.audio("cat3", "/assets/music/cat3.wav");
    this.load.audio("cat4", "/assets/music/cat4.wav");
    this.load.audio("cat5", "/assets/music/cat5.wav");
    this.load.audio("cat6", "/assets/music/cat6.wav");
  }

  init(data) {
    //initializing the socket passed to the waiting room
    this.socket = data.socket;
    this.state = { ...data };
  }

  create() {
    const scene = this;

    // BACKGROUND
    this.background = this.add.image(568, 320, "bg").setOrigin(0.5, 0.5);
    this.background.displayWidth = this.sys.canvas.width;
    this.background.displayHeight = this.sys.canvas.height;

    this.roomKeyText = this.add
      .text(540, 25, [scene.state.roomKey])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#ffffff")
      .setInteractive();

    this.home = this.add
      .text(1000, 50, ["HOME"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00ffff")
      .setInteractive();

    this.newGame = this.add
      .text(1000, 100, ["NEW GAME"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00ffff")
      .setInteractive();

    this.home = this.add
      .text(1000, 150, ["LOG IN"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00ffff")
      .setInteractive();

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

    this.playText = this.add
      .text(1000, 500, ["PLAY"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00ffff")
      .setInteractive();

    this.stopText = this.add
      .text(1000, 550, ["STOP"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00ffff")
      .setInteractive();

    this.playText.on("pointerdown", function () {
      Tone.start();
      Tone.Transport.start();
    });

    this.stopText.on("pointerdown", function () {
      Tone.Transport.stop();
    });

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

    // INSTRUCTIONS POP UP
    this.instructions = this.add
      .sprite(568, 320, "instructions")
      .setScale(.94)
      .setInteractive();
    this.anims.create({
      key: 'play',
      repeat: -1,
      frameRate: 7,
      frames: this.anims.generateFrameNames('instructions', { start: 0, end: 11 })
    })
    // PLAY background animation:
    this.instructions.play('play')
    this.instructions.on(
      "pointerdown",
      function (pointer) {
        //renders current room settings once destroyed
        scene.renderCurrentCats();
        scene.renderButtons(1, 2, 3, 4, 5, 6);
        this.instructions.destroy();
      }.bind(this)
    );

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
    this.dropZone1 = this.zone1.renderZone(570, 510, 410, 240);
    this.dropZone1.name = "dropZone1";

    this.zone2 = new Zone(this);
    this.dropZone2 = this.zone2.renderZone(285, 400, 160, 300);
    this.dropZone2.name = "dropZone2";

    this.zone3 = new Zone(this);
    this.dropZone3 = this.zone3.renderZone(400, 295, 160, 300);
    this.dropZone3.name = "dropZone3";

    this.zone4 = new Zone(this);
    this.dropZone4 = this.zone4.renderZone(550, 165, 140, 240);
    this.dropZone4.name = "dropZone4";

    this.zone5 = new Zone(this);
    this.dropZone5 = this.zone5.renderZone(675, 145, 160, 180);
    this.dropZone5.name = "dropZone5";

    this.zone6 = new Zone(this);
    this.dropZone6 = this.zone6.renderZone(750, 290, 280, 200);
    this.dropZone6.name = "dropZone6";

    this.zone7 = new Zone(this);
    this.dropZone7 = this.zone7.renderZone(850, 410, 250, 160);
    this.dropZone7.name = "dropZone7";

    // render cat menu buttons
    this.renderButtons = (a, b, c, d, e, f) => {
      if (a) {
        let playerCat = new Cat1(this);
        playerCat.render(80, 70, "Cat1");
        playerCat.name = "Cat1";
      }

      if (b) {
        let playerCat2 = new Cat2(this);
        playerCat2.render(80, 170, "Cat2");
        playerCat2.name = "Cat2";
      }

      if (c) {
        let playerCat3 = new Cat3(this);
        playerCat3.render(80, 270, "Cat3");
        playerCat3.name = "Cat3";
      }

      if (d) {
        let playerCat4 = new Cat4(this);
        playerCat4.render(80, 370, "Cat4");
        playerCat4.name = "Cat4";
      }

      if (e) {
        let playerCat5 = new Cat5(this);
        playerCat5.render(80, 470, "Cat5");
        playerCat5.name = "Cat5";
      }

      if (f) {
        let playerCat6 = new Cat6(this);
        playerCat6.render(80, 570, "Cat6");
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
        scene.renderButtons(a, b, c, d, e, f);

        //Add cat to the group:
        scene.currentPlayedCats.add(gameObject);

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

  update() { }
}
