export default class Menu {
  constructor(scene) {
    this.renderZone = (x, y, width, height) => {
      let dropZone = scene.add
        .zone(x, y, width, height)
        .setRectangleDropZone(width, height);
      dropZone.setData({ isMenu: true });
      return dropZone;
    };
  }
}
