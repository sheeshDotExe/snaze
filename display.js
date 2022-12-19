export class Display {
  constructor(width, height) {
    this.window = document.querySelector(".game-table");
    this.width = width;
    this.height = height;
    this.createWindow();
  }

  createWindow() {
    this.elements = [];
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement("tr");
      this.elements.push([]);
      for (let x = 0; x < this.width; x++) {
        const column = document.createElement("td");
        row.appendChild(column);
        this.elements[y].push(column);
      }
      this.window.appendChild(row);
    }
  }

  clear() {
    for (const row of this.elements) {
      for (const column of row) {
        column.style.background = "white";
      }
    }
  }

  draw(x, y, color) {
    this.elements[y][x].style.background = color;
  }
}
