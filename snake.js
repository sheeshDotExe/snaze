export const Direction = {
  Up: "up",
  Down: "down",
  Left: "left",
  Right: "right",
};

export class Snake {
  constructor(x, y) {
    this.coords = [
      [x, y],
      [x + 1, y],
    ];
    this.direction = Direction.Right;
  }

  move(borderX, borderY, level) {
    let newX = this.coords[this.coords.length - 1][0];
    let newY = this.coords[this.coords.length - 1][1];
    this.firstCoord = this.coords[0];
    switch (this.direction) {
      case Direction.Right: {
        newX++;
        if (newX >= borderX) {
          return false;
        }
        break;
      }
      case Direction.Left: {
        newX--;
        if (newX < 0) {
          return false;
        }
        break;
      }
      case Direction.Down: {
        newY++;
        if (newY >= borderY) {
          return false;
        }
        break;
      }
      case Direction.Up: {
        newY--;
        if (newY < 0) {
          return false;
        }
        break;
      }
    }
    for (const coord of this.coords) {
      if (coord[0] === newX && coord[1] === newY) {
        console.log("col");
        return false;
      }
    }

    if (level.checkCollision(newX, newY)) {
      return false;
    }

    for (let i = 0; i < this.coords.length - 1; i++) {
      this.coords[i] = this.coords[i + 1];
    }
    this.coords[this.coords.length - 1] = [newX, newY];
    return true;
  }

  addTail() {
    this.coords.unshift(this.firstCoord);
  }

  head() {
    return this.coords[this.coords.length - 1];
  }

  draw(display) {
    for (const coord of this.coords) {
      display.draw(coord[0], coord[1], "lightgreen");
    }
  }
}
