export default class Zone {
  constructor(scene) {
    this.renderZone = (x, y, width, height) => {
      let dropZone = scene.add
        .zone(x, y, width, height)
        .setRectangleDropZone(width, height);
      dropZone.setData({ occupied: false, isMenu: false });
      return dropZone;
    };
  }
}
