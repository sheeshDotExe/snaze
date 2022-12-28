import { newMaze } from "./mazeBuilder.js";
export class Maze {
  constructor(path) {
    this.loadData(path);
  }

  async loadData(path) {
    this.Olddata = await this.getData("./levels/level1.json").then((data) => {
      return data;
    });
  }

  async getData(path) {
    const response = await fetch(path);
    const json = await response.json();
    return json;
  }

  generateLevel() {
    let data = newMaze(["down", "right", "up", "left", "up"]);
    data = newMaze(["left", "up", "right", "down", "left"]);
    this.data = data;
  }

  draw(display) {
    if (this.data) {
      for (const coord of this.data["walls"]) {
        display.draw(coord[0], coord[1], "black");
      }

      for (const coord of this.data["food"]) {
        display.draw(coord[0], coord[1], "red");
      }
    }
  }

  checkCollision(x, y) {
    for (const coord of this.data["walls"]) {
      if (x === coord[0] && y == coord[1]) {
        return true;
      }
    }
    return false;
  }
}
