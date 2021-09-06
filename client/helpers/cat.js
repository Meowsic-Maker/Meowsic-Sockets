import * as Tone from "tone";

export default class Cat {
    constructor(scene, spriteName) {
        this.render = (x, y, sprite) => {
            let cat = scene.add
                .sprite(x, y, sprite, 0)
                .setScale(0.25)
                .setInteractive();
            scene.anims.create({
                key: spriteName,
                repeat: -1,
                frameRate: 5,
                frames: scene.anims.generateFrameNames(spriteName, { start: 1, end: 4 }),
            });
            cat.setData({
                soundOn: false,
                spriteName: spriteName,
                music: `/assets/music/${spriteName}.wav`,
                dropZones: [],
                meowSounds: [],
                meow() {
                    const meowSound = new Tone.Player({
                        url: this.music,
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
