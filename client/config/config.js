// if w/h on 8-11 can't be detected, revert to these default specs
const DEFAULT_WIDTH = //window.innerWidth * window.devicePixelRatio
1136
const DEFAULT_HEIGHT = //window.innerHeight * window.devicePixelRatio
640

export default {
    type: Phaser.CANVAS, // Specify the underlying browser rendering engine (AUTO, CANVAS, WEBGL)
    // AUTO will attempt to use WEBGL, but if not available it'll default to CANVAS
    width: window.innerWidth * window.devicePixelRatio,
    //1136, // Game width in pixels
    height: window.innerHeight * window.devicePixelRatio,
    //640, // Game height in pixels
    render: {
        pixelArt: true,
    },
    scale: {
        parent: "mygame",
        mode: Phaser.Scale.FIT,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    height: DEFAULT_HEIGHT,
    //  We will be expanding physics later
    physics: {
        default: "arcade",
        arcade: {
            debug: false, // Whether physics engine should run in debug mode
        },
    },
    dom: {
        createContainer: true,
    },
    scene: [],
};
