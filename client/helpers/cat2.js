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
        music: "/assets/music/cat2.wav",
        dropZones: [],
        meowSounds: [],
        spriteName: "Cat2",
        meow() {
          const meowSound = new Tone.Player({
            url: this.music,
            loop: true,
          })
            .toDestination()
            .sync()
            .start(0);
          this.meowSounds.push(meowSound);
        },
      });
      scene.input.setDraggable(cat);
      return cat;
    };
  }
}
