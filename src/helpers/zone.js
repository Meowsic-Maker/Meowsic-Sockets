export default class Zone {
  constructor(scene) {
    this.renderZone = (x, y, width, height) => {
      let dropZone = scene.add
        .zone(x, y, width, height)
        .setRectangleDropZone(width, height);
      dropZone.setData({ cats: 0 });
      return dropZone;
    };
    this.renderOutline = (dropZone) => {
      let dropZoneOutline = scene.add.graphics();
      dropZoneOutline.lineStyle(4, 0xff69b4);
      dropZoneOutline.strokeRect(
        dropZone.x - dropZone.input.hitArea.width / 2,
        dropZone.y - dropZone.input.hitArea.height / 2,
        dropZone.input.hitArea.width,
        dropZone.input.hitArea.height
      );
    };
  }
}
