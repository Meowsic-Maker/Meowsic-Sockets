const DEFAULT_WIDTH = 1136
const DEFAULT_HEIGHT = 640

export default {
    type: Phaser.AUTO, // Specify the underlying browser rendering engine (AUTO, CANVAS, WEBGL)
    // AUTO will attempt to use WEBGL, but if not available it'll default to CANVAS
    width: 1136, // Game width in pixels
    height: 640, // Game height in pixels
    render: {
        pixelArt: true,
    },
    scale: {
        parent: "mygame",
        mode: 'SMOOTH',
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        autoCenter: true
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