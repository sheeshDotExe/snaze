import { Display } from "./display.js";
import { Maze } from "./maze.js";
import { Snake, Direction } from "./snake.js";

class Game {
  constructor() {
    this.display = new Display(10, 10);
    this.snake = new Snake(0, 5);
    this.food = [[5, 5]];
    this.canChangeDirection = true;
    this.stuckTicks = 0;
    this.level = new Maze("./levels/level1.json");
    window.addEventListener("keydown", (event) => {
      this.setDirection(event);
    });
  }

  run() {
    const loopId = setInterval(() => {
      this.update();
    }, 150);
    this.setLoopId(loopId);
  }

  checkFood() {
    const snakeHead = this.snake.head();
    for (const food in this.food) {
      if (
        this.food[food][0] === snakeHead[0] &&
        this.food[food][1] === snakeHead[1]
      ) {
        this.snake.addTail();
        this.food.splice(food, 1);
        this.food.push([
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
        ]);
        break;
      }
    }
  }

  drawFood() {
    for (const food of this.food) {
      this.display.draw(food[0], food[1], "red");
    }
  }

  setLoopId(id) {
    this.loopId = id;
  }

  setDirection(key) {
    if (!this.canChangeDirection) {
      return;
    }
    switch (key.key) {
      case "w": {
        if (this.snake.direction !== Direction.Down) {
          this.snake.direction = Direction.Up;
        }
        this.canChangeDirection = false;
        break;
      }
      case "s": {
        if (this.snake.direction !== Direction.Up) {
          this.snake.direction = Direction.Down;
        }
        this.canChangeDirection = false;
        break;
      }
      case "a": {
        if (this.snake.direction !== Direction.Right) {
          this.snake.direction = Direction.Left;
        }
        this.canChangeDirection = false;
        break;
      }
      case "d": {
        if (this.snake.direction !== Direction.Left) {
          this.snake.direction = Direction.Right;
        }
        this.canChangeDirection = false;
        break;
      }
    }
  }

  update() {
    this.canChangeDirection = true;
    if (this.stuckTicks >= 10) {
      console.log("ded");
      clearInterval(this.loopId);
    }
    if (!this.snake.move(10, 10, this.level)) {
      this.stuckTicks++;
      return false;
    }
    this.checkFood();
    this.display.clear();
    this.level.draw(this.display);
    this.snake.draw(this.display);
    this.drawFood();
    this.stuckTicks = 0;
    return true;
  }
}

function loop(game) {
  game.update();
}

function main() {
  const game = new Game();
  game.run();
}

main();
