import * as Tone from "tone";

export default class Cat2 {
  constructor(scene) {
    this.render = (x, y, sprite) => {
      let cat = scene.add
        .image(x, y, sprite)
        .setDisplaySize(90, 80)
        .setInteractive();
      cat.setData({
        soundOn: false,
        spriteName: "Cat2",
        music: "/assets/music/cat2.wav",
        dropZones: [],
        meowSounds: [],
        meow() {
          const meowSound = new Tone.Player({
            url: this.music,
            volume: -5,
            loop: true,
            autostart: true,
          }).toDestination();
          if (
            Tone.Transport.state === "started" ||
            Tone.Transport.state === "stopped"
          ) {
            Tone.Transport.schedule((time) => {
              meowSound.start(time);
            }, "0m");
          }
          // else {
          //   meowSound.sync().start(0);
          // }
          this.meowSounds.push(meowSound);
        },
      });
      scene.input.setDraggable(cat);
      return cat;
    };
  }
}
