import * as Tone from "tone";

export default class Cat5 {
  constructor(scene) {
    this.render = (x, y, sprite) => {
      let cat = scene.add
        .image(x, y, sprite)
        .setDisplaySize(90, 80)
        .setInteractive();
      cat.setData({
        soundOn: false,
        spriteName: "Cat5",
        music: "/assets/music/cat5.wav",
        dropZones: [],
        meowSounds: [],
        meow() {
          const meowSound = new Tone.Player(this.music).toDestination();
          this.meowSounds.push(meowSound);
          Tone.loaded().then(() => {
            meowSound.start();
            meowSound.loop = true;
          });
        },
      });
      scene.input.setDraggable(cat);
      return cat;
    };
  }
}
