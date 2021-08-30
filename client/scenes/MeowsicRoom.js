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
    console.log(this.state);

    // background
    this.background = this.add.image(568, 320, "bg").setOrigin(0.5, 0.5);
    // Based on your game size, it may "stretch" and distort.
    this.background.displayWidth = this.sys.canvas.width;
    this.background.displayHeight = this.sys.canvas.height;

    // let image = this.add.image(
    //   this.cameras.main.width / 2,
    //   this.cameras.main.height / 2,
    //   "bg"
    // );
    // let scaleX = this.cameras.main.width / image.width;
    // let scaleY = this.cameras.main.height / image.height;
    // let scale = Math.max(scaleX, scaleY);
    // image.setScale(scale).setScrollFactor(0);

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
      .text(1000, 80, ["PLAY"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00ffff")
      .setInteractive();

    this.stopText = this.add
      .text(1000, 120, ["STOP"])
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

    //////HANDLING CAT RENDERING THROUGH SOCKET///////

    //Create a renderCat function that renders placed cats:
    this.renderCat = (selectedDropZone, spriteName, x, y) => {
      let playerCat;
      //see which cat was placed and render appropriate cat:
      switch (spriteName) {
        case "Cat1":
          playerCat = new Cat1(scene);
        case "Cat2":
          playerCat = new Cat2(scene);
        default:
          playerCat = new Cat1(scene);
      }
      //find a way to find the dropzone! This was coming up as undefined**
      //scene[selectedDropZone].data.values.occupied = true;

      const renderedCat = playerCat.render(x, y, spriteName).setInteractive();

      //adding dropzone to the cat's dropzone array
      renderedCat.data.values.dropZones.push(selectedDropZone);
      // turning cat's sound on
      renderedCat.data.values.soundOn = true;
      // activating cat meow
      scene.input.setDraggable(renderedCat);
      console.log(renderedCat);
      if (renderedCat.data.values.dropZones.length <= 1) {
        renderedCat.data.values.meow();
      }
    };

    /* REMOVING CATS function that removes a cat
    //this.removeCat = (selectedDropZone, spriteName, x, y) => {
      - curent cats in the given meowsic room
      - all currentCats are on a dropZone
       const placedCats = [gameObject.data.values.spriteName. etc]
      - event listens for any cats in the placexdCat array to be moved off a dropZone and placed back to menu
       if (placedCatsArray.dropZone.data.values.isMenu ) {
      }
      // if cat moves off dropZone, remove from array, and send a removal notification to the server - pseudo code on 325
    } */

    // CREATE OTHER PLAYERS GROUP
    // this.otherPlayers = this.physics.add.group();

    // addOtherPlayers(scene, playerInfo) {
    //   const otherPlayer = scene.add.sprite(
    //     playerInfo.x + 40,
    //     playerInfo.y + 40,
    //     "astronaut"
    //   );

    //placedCat.currentX
    //.currentY

    //   otherPlayer.playerId = playerInfo.playerId;
    //   scene.otherPlayers.add(otherPlayer);
    // }

    //   this.socket.on("disconnected", function (arg) {
    //     const { playerId, numPlayers } = arg;
    //     scene.state.numPlayers = numPlayers;
    //     scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
    //       if (playerId === otherPlayer.playerId) {
    //         otherPlayer.destroy();
    //       }
    //     });
    //   });
    // }

    //FUNCTION UPDATING CATS FOR OTHER PLAYERS WHEN USER JOINS
    this.renderCurrentCats = () => {
      const { players, numPlayers, placedCats, roomKey } = scene.state;
      console.log(placedCats);
      placedCats.forEach((cat) => {
        scene.renderCat(cat.dropZone, cat.spriteName, cat.x, cat.y);
      });
    };
    //call the currentCats function:
    this.renderCurrentCats();

    //When a current cat is placed in another socket, server emits this:
    this.socket.on("catPlayedUpdate", function (args) {
      const { x, y, selectedDropZone, socketId, roomKey, spriteName } = args;
      //check to see if the socket that placed the cat is the socket we are one:
      if (socketId !== scene.socket.id) {
        //render cats using our function:
        scene.renderCat(selectedDropZone, spriteName, x, y);
      }
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
        // Tone.Transport.start();
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

    this.gameButton3.on(
      "pointerdown",
      function (pointer) {
        bellSound();
        let playerCat3 = new Cat3(this);
        playerCat3.render(80, 270, "Cat2");
        playerCat3.name = "Cat3";
      }.bind(this)
    );

    this.gameButton4.on(
      "pointerdown",
      function (pointer) {
        bellSound();
        let playerCat4 = new Cat4(this);
        playerCat4.render(80, 370, "Cat2");
        playerCat4.name = "Cat4";
      }.bind(this)
    );

    this.gameButton5.on(
      "pointerdown",
      function (pointer) {
        bellSound();
        let playerCat5 = new Cat5(this);
        playerCat5.render(80, 470, "Cat2");
        playerCat5.name = "Cat5";
      }.bind(this)
    );

    this.gameButton6.on(
      "pointerdown",
      function (pointer) {
        bellSound();
        let playerCat6 = new Cat6(this);
        playerCat6.render(80, 570, "Cat2");
        playerCat6.name = "Cat6";
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
        // reset the previously filled zone to empty
        gameObject.data.values.dropZones.forEach(
          (zone) => (zone.data.values.occupied = false)
        );
        gameObject.data.values.soundOn = false;
        // stop meow
        gameObject.data.values.meowSounds[0].disconnect().stop();
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
        console.log(gameObject); //?
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

      /*  send a notice to server that cat has been removed from drop zone
       scene.socket.emit("catRemoved", {
        x: dropZone.x,
        y: dropZone.y,
        selectedDropZone: dropZone.name,
        socketId: scene.socket.id,
        roomKey: scene.state.roomKey,
        spriteName: gameObject.data.values.spriteName

       })
      */
    });
  }

  update() {}
}
