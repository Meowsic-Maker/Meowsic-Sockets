import * as Tone from "tone";

export default class Cat4 {
  constructor(scene) {
    this.render = (x, y, sprite) => {
      let cat = scene.add
        .image(x, y, sprite)
        .setDisplaySize(90, 80)
        .setInteractive();
      cat.setData({
        soundOn: false,
        spriteName: "Cat4",
        music: "/assets/music/bell.mp3",
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
