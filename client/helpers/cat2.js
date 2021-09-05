import * as Tone from "tone";

export default class Cat2 {
  constructor(scene) {
    this.render = (x, y, sprite) => {
      let cat = scene.add
        .sprite(x, y, sprite, 0)
        .setScale(0.25)
        .setInteractive();
      scene.anims.create({
        key: "Cat2",
        repeat: -1,
        frameRate: 5,
        frames: scene.anims.generateFrameNames("Cat2", { start: 1, end: 4 }),
      });
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
          this.meowSounds.push(meowSound);
        },
      });
      scene.input.setDraggable(cat);
      return cat;
    };
  }
}
