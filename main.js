import { Display } from "./display.js";
import { Maze } from "./maze.js";
import { Snake, Direction } from "./snake.js";

class Game {
  constructor() {
    this.display = new Display(10, 10);
    this.snake = new Snake(0, 4);
    this.canChangeDirection = true;
    this.stuckTicks = 0;
    this.level = new Maze("./levels/level1.json");
    window.addEventListener("keydown", (event) => {
      this.setDirection(event);
    });

    this.level.generateLevel();
  }

  run() {
    const loopId = setInterval(() => {
      this.update();
    }, 150);
    this.setLoopId(loopId);
  }

  checkFood() {
    const snakeHead = this.snake.head();
    for (const food in this.level.data["food"]) {
      if (
        this.level.data["food"][food][0] === snakeHead[0] &&
        this.level.data["food"][food][1] === snakeHead[1]
      ) {
        this.snake.addTail();
        this.level.data["food"].splice(food, 1);
        break;
      }
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
        if (
          this.snake.direction !== Direction.Down &&
          this.snake.direction !== Direction.Up
        ) {
          this.snake.direction = Direction.Up;
        }
        this.canChangeDirection = false;
        break;
      }
      case "s": {
        if (
          this.snake.direction !== Direction.Up &&
          this.snake.direction !== Direction.Down
        ) {
          this.snake.direction = Direction.Down;
        }
        this.canChangeDirection = false;
        break;
      }
      case "a": {
        if (
          this.snake.direction !== Direction.Right &&
          this.snake.direction !== Direction.Left
        ) {
          this.snake.direction = Direction.Left;
        }
        this.canChangeDirection = false;
        break;
      }
      case "d": {
        if (
          this.snake.direction !== Direction.Left &&
          this.snake.direction !== Direction.Right
        ) {
          this.snake.direction = Direction.Right;
        }
        this.canChangeDirection = false;
        break;
      }
    }
  }

  update() {
    /*
    if (this.stuckTicks >= 10) {
      console.log("ded");
      clearInterval(this.loopId);
    }
    */
    if (!this.snake.move(10, 10, this.level)) {
      this.stuckTicks++;
      this.canChangeDirection = true;
      return false;
    }
    this.checkFood();
    this.display.clear();
    this.level.draw(this.display);
    this.snake.draw(this.display);
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
