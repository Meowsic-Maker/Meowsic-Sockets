import Phaser from "phaser";
import Cat1 from "../helpers/cat1";
import Cat2 from "../helpers/cat2";
import Menu from "../helpers/menu";
import Zone from "../helpers/zone";
import * as Tone from "tone";

export default class MeowsicRoom extends Phaser.Scene {
  constructor() {
    super("MeowsicRoom");
    this.state = {};
  }

  preload() {
    this.load.image("bg", "/assets/stagebg.jpg");
    this.load.image("Cat1", "/assets/happyneko.png");
    this.load.image("Cat2", "/assets/neko.jpeg");
    this.load.image("button1", "/assets/latteneko.png");
    this.load.image("button2", "/assets/caliconeko.png");
    this.load.image("button3", "/assets/greyneko.png");
    this.load.image("button4", "/assets/kuroneko.png");
    this.load.image("button5", "/assets/sleepyneko.png");
    this.load.image("button6", "/assets/coffeeneko.png");
    this.load.audio("bossanova", "/assets/bossa-nova-bass.wav");
    this.load.audio("meow", "/assets/meow.mp3");
    this.load.audio("bell", "/assets/bell.mp3");
  }

  init(data) {
    //initializing the socket passed to the waiting room
    this.socket = data.socket;
    this.state = { ...data };
  }

  create() {
    const scene = this;
    console.log(this.state);

    let image = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "bg"
    );
    let scaleX = this.cameras.main.width / image.width;
    let scaleY = this.cameras.main.height / image.height;
    let scale = Math.max(scaleX, scaleY);
    image.setScale(scale).setScrollFactor(0);

    // sound effects
    const soundTrack = () => {
      const accompaniment = new Tone.Player(
        "/assets/bossa-nova-bass.wav"
      ).toDestination();
      accompaniment.volume.value = -5;
      accompaniment.autostart = true;
      accompaniment.loop = true;
    };
    // soundTrack();

    const bellSound = () => {
      const bell = new Tone.Player("/assets/bell.mp3").toDestination();
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

    // CREATE CURRENT PLAYED CATS GROUP
    this.playedCats = this.physics.add.group();

    //Isn't being called anywhere at the moment:
    //disable the dealText so that we can't just keep generating cards for no reason.
    // this.socket.on('dealCats', function () {
    //     scene.dealCats();
    //     scene.dealText.disableInteractive();
    // })

    this.socket.on("catPlayedUpdate", function (args) {
      console.log("cat played update: args", args);
      const { x, y, selectedDropZone, socketId, roomKey, spriteName } = args;
      let playerCat;
      //check to see if the socket that placed the cat is the socket we are one:
      if (socketId !== scene.socket.id) {
        //see which cat was placed and render appropriate cat:
        switch (spriteName) {
          case "Cat1":
            playerCat = new Cat1(scene);
          case "Cat2":
            playerCat = new Cat2(scene);
          default:
            playerCat = new Cat1(scene);
        }

        scene[selectedDropZone].data.values.occupied = true;
        const renderedCat = playerCat.render(x, y, spriteName);
        renderedCat.data.values.dropZones.push(selectedDropZone);
        renderedCat.data.values.soundOn = true;
        if (renderedCat.data.values.dropZones.length <= 1) {
          renderedCat.data.values.meow();
        }
      }
    });

    // UPDATING CATS FOR OTHER PLAYERS
    //should receieve played cats information (including locations, catnames, etc)
    this.socket.on("currentPlayersAndCats", function (arg) {
      const { players, numPlayers, placedCats } = arg;
      scene.state.numPlayers = numPlayers;
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId === scene.socket.id) {
          scene.addPlayer(scene, players[id]);
        } else {
          scene.addOtherPlayers(scene, players[id]);
        }
      });
    });

    this.socket.on("newPlayer", function (arg) {
      console.log("newPlayer?");
      const { playerInfo, numPlayers } = arg;
      scene.addOtherPlayers(scene, playerInfo);
      scene.state.numPlayers = numPlayers;
    });

    //STATE

    // DISCONNECT
    this.socket.on("disconnected", function (arg) {
      const { playerId, numPlayers } = arg;
      scene.state.numPlayers = numPlayers;
      //CODE to populate user info stuff eventually:
      // scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
      //     if (playerId === otherPlayer.playerId) {
      //         otherPlayer.destroy();
      //     }
      // });
    });

    // render zones
    this.menuZone = new Menu(this);
    this.menuDropZone = this.menuZone.renderZone(80, 320, 120, 600);
    this.menuZone.name = "menuZone";

    this.zone1 = new Zone(this);
    this.dropZone1 = this.zone1.renderZone(570, 510, 410, 240);
    this.dropZone1.name = "dropZone1";

    this.zone2 = new Zone(this);
    this.dropZone2 = this.zone2.renderZone(285, 400, 160, 300);
    this.dropZone2.name = "dropZone2";

    this.zone3 = new Zone(this);
    this.dropZone3 = this.zone3.renderZone(405, 295, 160, 300);
    this.dropZone3.name = "dropZone3";

    this.zone4 = new Zone(this);
    this.dropZone4 = this.zone4.renderZone(540, 160, 140, 240);
    this.dropZone3.name = "dropZone4";

    this.zone5 = new Zone(this);
    this.dropZone5 = this.zone5.renderZone(685, 130, 160, 180);
    this.dropZone5.name = "dropZone5";

    this.zone6 = new Zone(this);
    this.dropZone6 = this.zone6.renderZone(750, 290, 280, 200);
    this.dropZone3.name = "dropZone6";

    this.zone7 = new Zone(this);
    this.dropZone7 = this.zone7.renderZone(850, 410, 250, 160);
    this.dropZone3.name = "dropZone7";

    // render cat menu buttons
    this.gameButton1 = this.add
      .sprite(80, 70, "button1")
      .setDisplaySize(90, 80)
      .setInteractive();

    this.gameButton2 = this.add
      .sprite(80, 170, "button2")
      .setDisplaySize(90, 80)
      .setInteractive();

    this.gameButton3 = this.add
      .sprite(80, 270, "button3")
      .setDisplaySize(90, 80)
      .setInteractive();

    this.gameButton4 = this.add
      .sprite(80, 370, "button4")
      .setDisplaySize(90, 80)
      .setInteractive();

    this.gameButton5 = this.add
      .sprite(80, 470, "button5")
      .setDisplaySize(90, 80)
      .setInteractive();

    this.gameButton6 = this.add
      .sprite(80, 570, "button6")
      .setDisplaySize(90, 80)
      .setInteractive();

    // RENDER new cats from menu buttons
    this.gameButton1.on(
      "pointerdown",
      function (pointer) {
        bellSound();
        let playerCat = new Cat1(this);
        playerCat.render(80, 70, "Cat1");
        playerCat.name = "Cat1";
      }.bind(this)
    );

    this.gameButton2.on(
      "pointerdown",
      function (pointer) {
        bellSound();
        let playerCat2 = new Cat2(this);
        playerCat2.render(80, 170, "Cat2");
        playerCat2.name = "Cat2";
      }.bind(this)
    );

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
      // if cat is dropped back in menu
      if (dropZone.data.values.isMenu) {
        // reset all previously occupied zones
        gameObject.data.values.dropZones.forEach(
          (zone) => (zone.data.values.occupied = false)
        );
        gameObject.data.values.soundOn = false;
        // stop meow
        gameObject.data.values.meowSounds[0].stop();
        // remove cat
        gameObject.destroy();
      } else if (!dropZone.data.values.occupied) {
        // if cat is dropped in any other zone, snap into place
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        // set zone to occupied
        dropZone.data.values.occupied = true;
        // if cat has visited other zones, reset those zones
        if (gameObject.data.values.dropZones.length !== 0) {
          gameObject.data.values.dropZones.forEach(
            (zone) => (zone.data.values.occupied = false)
          );
        }
        // add current zone to zone history
        gameObject.data.values.dropZones.push(dropZone);
        gameObject.data.values.soundOn = true;
        // ensure cat only starts sound player once
        if (gameObject.data.values.dropZones.length <= 1) {
          gameObject.data.values.meow();
        }
        //send a notice to server that a cat has been played
        // cat is being dropped
        console.log(gameObject);
        scene.socket.emit("catPlayed", {
          x: dropZone.x,
          y: dropZone.y,
          selectedDropZone: dropZone.name,
          socketId: scene.socket.id,
          roomKey: scene.state.roomKey,
          spriteName: gameObject.data.values.spriteName,
        });
      } else {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
    });
  }

  update() {}
}
