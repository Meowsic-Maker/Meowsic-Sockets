import * as Tone from "tone";

export default class Cat6 {
  constructor(scene) {
    this.render = (x, y, sprite) => {
      let cat = scene.add
        .image(x, y, sprite)
        .setDisplaySize(90, 80)
        .setInteractive();
      cat.setData({
        soundOn: false,
        spriteName: "Cat6",
        music: "/assets/music/cat6.wav",
        dropZones: [],
        meowSounds: [],
        meow() {
          const meowSound = new Tone.Player(this.music).toDestination();
          // this.meowSounds.push(meowSound);
          Tone.loaded().then(() => {
            meowSound.start();
            meowSound.loop = true;
            const loop = new Tone.Loop((time) => {
              meowSound.start();
            }, "1n").start(0);
            meowSounds.push(loop);
            Tone.Transport.bpm.value = 80;
            Tone.Transport.start();
          });
        },
      });
      scene.input.setDraggable(cat);
      return cat;
    };
  }
}
