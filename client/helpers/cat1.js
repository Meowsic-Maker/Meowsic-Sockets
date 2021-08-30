import * as Tone from "tone";

export default class Cat1 {
  constructor(scene) {
    this.render = (x, y, sprite) => {
      let cat = scene.add
        .image(x, y, sprite)
        .setDisplaySize(90, 80)
        .setInteractive();
      cat.setData({
        soundOn: false,
        spriteName: "Cat1",
        music: "/assets/music/bell.mp3",
        dropZones: [],
        meowSounds: [],
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
