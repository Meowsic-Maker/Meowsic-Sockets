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
    this.load.image("bg", "/assets/bg.jpg");
    this.load.image("cat", "/assets/happyneko.png");
    this.load.image("cat2", "/assets/neko.jpeg");
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
  }

  create() {
    const scene = this;

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
    soundTrack();

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
      //first compares the isPlayerA boolean it receives from the server against the client's own isPlayerA,
      //which is a check to determine whether the client that is receiving the event is the same one that generated it.
      console.log(args);
      const { x, y, selectedDropZone, socketId } = args;

      if (socketId !== scene.socket.id) {
        scene[selectedDropZone].data.values.occupied = true;
        let playerCat = new Cat(scene);
        playerCat.render(x, y, "cat")
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
      const { playerInfo, numPlayers } = arg;
      scene.addOtherPlayers(scene, playerInfo);
      scene.state.numPlayers = numPlayers;
    });

    //JOINED ROOM - SET STATE
    this.socket.on("setState", function (state) {
      const { roomKey, players, numPlayers, placedCats } = state;
      scene.physics.resume();

      //STATE
      scene.state.roomKey = roomKey;
      scene.state.players = players;
      scene.state.numPlayers = numPlayers;
      scene.state.inRoom = true;
      scene.state.placedCats = placedCats;
    });

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
    this.menuDropZone = this.menuZone.renderZone(80, 390, 120, 660);
    this.menuOutline = this.menuZone.renderOutline(this.menuDropZone);
    this.menuZone.name = "menuZone";

    this.zone1 = new Zone(this);
    this.dropZone1 = this.zone1.renderZone(600, 480, 210, 360);
    this.outline1 = this.zone1.renderOutline(this.dropZone1);
    this.dropZone1.name = "dropZone1";

    this.zone2 = new Zone(this);
    this.dropZone2 = this.zone2.renderZone(330, 400, 140, 240);
    this.outline2 = this.zone2.renderOutline(this.dropZone2);
    this.dropZone2.name = "dropZone2";

    this.zone3 = new Zone(this);
    this.dropZone3 = this.zone3.renderZone(470, 300, 140, 200);
    this.outline3 = this.zone3.renderOutline(this.dropZone3);
    this.dropZone3.name = "dropZone3";

    this.zone4 = new Zone(this);
    this.dropZone4 = this.zone4.renderZone(610, 200, 140, 200);
    this.outline4 = this.zone4.renderOutline(this.dropZone4);
    this.dropZone3.name = "dropZone4";

    this.zone5 = new Zone(this);
    this.dropZone5 = this.zone5.renderZone(740, 150, 120, 180);
    this.outline5 = this.zone5.renderOutline(this.dropZone5);
    this.dropZone5.name = "dropZone5";

    this.zone6 = new Zone(this);
    this.dropZone6 = this.zone6.renderZone(860, 305, 220, 130);
    this.outline6 = this.zone6.renderOutline(this.dropZone6);
    this.dropZone3.name = "dropZone6";

    this.zone7 = new Zone(this);
    this.dropZone7 = this.zone7.renderZone(920, 440, 220, 140);
    this.outline7 = this.zone7.renderOutline(this.dropZone7);
    this.dropZone3.name = "dropZone7";

    // render cat menu buttons
    this.gameButton1 = this.add
      .sprite(80, 120, "button1")
      .setDisplaySize(90, 80)
      .setInteractive();

    this.gameButton2 = this.add
      .sprite(80, 220, "button2")
      .setDisplaySize(90, 80)
      .setInteractive();

    this.gameButton3 = this.add
      .sprite(80, 320, "button3")
      .setDisplaySize(90, 80)
      .setInteractive();

    this.gameButton4 = this.add
      .sprite(80, 420, "button4")
      .setDisplaySize(90, 80)
      .setInteractive();

    this.gameButton5 = this.add
      .sprite(80, 520, "button5")
      .setDisplaySize(90, 80)
      .setInteractive();

    this.gameButton6 = this.add
      .sprite(80, 620, "button6")
      .setDisplaySize(90, 80)
      .setInteractive();

    // render new cats from menu buttons
    this.gameButton1.on(
      "pointerdown",
      function (pointer) {
        bellSound();
        let playerCat = new Cat1(this);
        playerCat.render(80, 120, "cat");
        playerCat.name = "Cat 1";
      }.bind(this)
    );

    this.gameButton2.on(
      "pointerdown",
      function (pointer) {
        bellSound();
        let playerCat2 = new Cat2(this);
        playerCat2.render(80, 220, "cat2");
        playerCat2.name = "Cat 2";
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
        console.log(gameObject)
        scene.socket.emit('catPlayed', {
          x: dropZone.x,
          y: dropZone.y,
          selectedDropZone: dropZone.name,
          socketId: scene.socket.id,
          roomKey: scene.state.roomKey
        })


      } else {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
    });
  }

  update() { }
}
