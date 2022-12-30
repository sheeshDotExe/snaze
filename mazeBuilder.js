const NODE_SIZE = 5;
const MOVE_TYPES = ["left", "right", "up", "down"];

const MOVE_TO_VECTOR = {
  left: [-1, 0],
  right: [1, 0],
  up: [0, -1],
  down: [0, 1],
};

// inverse of move vector
const FORCE_DIRECTION_VECTOR = {
  left: [1, 0],
  right: [-1, 0],
  up: [0, 1],
  down: [0, -1],
};

const OPOSITE = {
  left: "right",
  right: "left",
  up: "down",
  down: "up",
};

// moves == ["down", "right", "up", "left", "up"]
export function newMaze(moves, seed) {
  // chunk the moves
  const chunks = chunkMoves(moves);

  const nodes = generateInputOutput(chunks);

  const rooms = [];
  for (const node of nodes) {
    const room = new Node(node.chunk, node.input, node.output);
    rooms.push(room);
  }

  /*
  testing
  */
  const data = { walls: [], food: [] };

  let delta = 7;

  for (const room of rooms) {
    for (const wall of room.data["walls"]) {
      data["walls"].push([wall[0] + delta, wall[1] + 5]);
    }
    for (const food of room.data["food"]) {
      data["food"].push([food[0] + delta, food[1] + 5]);
    }
    data["marker"] = [
      [room.startCoord[0] + delta, room.startCoord[1] + 5],
      [room.outCoord[0] + delta, room.outCoord[1] + 5],
    ];
  }
  return data;

  // link all rooms together and project them to screen space
}

function chunkMoves(moves) {
  // chunk the moves into different rooms
  const chunkedMoves = [];
  for (let i = 0; i < moves.length; i += NODE_SIZE) {
    // can be changed for more variety
    const chunk = [];
    for (let j = 0; j < NODE_SIZE; j++) {
      // would follow changes made above
      if (i + j < moves.length) {
        chunk.push(moves[i + j]);
      }
    }
    chunkedMoves.push(chunk);
  }
  return chunkedMoves;
}

function generateInputOutput(chunks) {
  // generate information about rooms
  const nodes = [];
  let index = 1;
  for (const chunk of chunks) {
    const node = {};
    // the extra must be odd or it creates multiple solutions
    const input = index + 1; // change for random input values
    const output = input + 1; // change for longer nodes
    index = output;

    node["input"] = input;
    node["output"] = output;
    node["chunk"] = chunk;

    nodes.push(node);
  }
  // shuffle nodes for more difficulty

  return nodes;
}

function countMoves(moves) {
  const counter = {};

  for (const moveType of MOVE_TYPES) {
    counter[moveType] = 0;
  }

  for (const move of moves) {
    counter[move]++;
  }

  return counter;
}

function chunkWhiteSpace(moves, horizontal, vertical) {
  const spaceCounter = [];

  const moveCount = countMoves(moves.slice(0, moves.length - 1)); // last move will move out of the room

  const horizontalSpace = horizontal / 2;
  const verticalSpace = vertical / 2;

  // can split into uneven chunks for more variety
  const leftChunk = horizontalSpace / moveCount["left"];
  const rightChunk = horizontalSpace / moveCount["right"];
  const downChunk = verticalSpace / moveCount["down"];
  const upChunk = verticalSpace / moveCount["up"];

  // temp for constant spacing
  const chunkObj = {
    left: leftChunk,
    right: rightChunk,
    up: upChunk,
    down: downChunk,
  };

  for (const move of moves.slice(0, moves.length - 1)) {
    let length = chunkObj[move];
    if (chunkObj[OPOSITE[move]] === Infinity) {
      length += 1;
    }
    spaceCounter.push([move, length]);
  }

  return spaceCounter;
}

// each node has 4 moves
class Node {
  constructor(moves, inputSize, outputSize) {
    if (moves.length < NODE_SIZE) {
      console.error("Invalid chunk size...");
      return null;
    }

    this.moves = moves;
    this.mLength = moves.length;
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.moveCounts = countMoves(moves);

    this.inputDirection = moves[0];
    this.outputDirection = moves[this.mLength - 1];

    this.delta = outputSize - inputSize; // number of food needed to reach desired size

    /*
    still need a better way of calculating start coord and output coord
    */

    this.startCoord = [1, 0]; // change for dynamic rooms

    if (OPOSITE[this.outputDirection] === this.inputDirection) {
      // static room
      this.outCoord = this.startCoord;
      this.sameOutput = true;
    } else {
      this.outCoord = [0, 1];
      this.sameOutput = false;
    }

    this.data = this.createData();
  }

  // moves == ["down", "right", "up", "left", "up"]
  createData() {
    // generate json data for node room
    // could rcursivly chunk each node into smaller rooms, but i cba. Thus, each room wil force it's moves

    // if sameoutput = false, then the outputcoord must cross the input direction

    const localRoomData = { walls: [], food: [] };
    const whitespace = this.outputSize + 1; // number of tiles the snake must move between the exit point

    let minHorizontalSpace =
      Math.max(this.moveCounts["left"], this.moveCounts["right"]) * 2; // times 2 so it can get back to its original position

    if (this.moves[0] === "down" || this.moves[0] === "up") {
      minHorizontalSpace += 2; // make space to move left/right
    }

    let minVerticalSpace =
      Math.max(this.moveCounts["up"], this.moveCounts["down"]) * 2;

    if (this.moves[0] === "right" || this.moves[0] === "left") {
      minVerticalSpace += 2; // make space to move up/down
    }

    const spaceUsed =
      minHorizontalSpace + minVerticalSpace - (this.moves.length - 1);

    let spaceLeft = whitespace - spaceUsed;
    let foodLeft = this.delta; // number of food that must be placed (location can be randomized)

    if (spaceLeft < 0) {
      console.error("impossible data!!"); // check if room can be made (accounting for overlap)
    } else if (spaceLeft > 0) {
      //distribute remaining space to vertical and horizontal space
      minHorizontalSpace += spaceLeft;
    }
    // split the space into chunks
    console.log(this.moves);
    const moveSpace = chunkWhiteSpace(
      this.moves,
      minHorizontalSpace,
      minVerticalSpace
    );

    console.log(
      minHorizontalSpace,
      minVerticalSpace,
      spaceLeft,
      spaceUsed,
      whitespace
    );

    // iterate moves and force direction with walls
    let overlap = false;
    let xCoord = this.startCoord[0];
    let yCoord = this.startCoord[1];

    // add walls around start

    if (this.moves[0] === "down" || this.moves[0] === "up") {
      localRoomData["walls"].push([this.startCoord[0] - 1, this.startCoord[1]]);
      localRoomData["walls"].push([this.startCoord[0] + 1, this.startCoord[1]]);
    } else if (this.moves[0] === "left" || this.moves[0] === "right") {
      localRoomData["walls"].push([this.startCoord[0], this.startCoord[1] - 1]);
      localRoomData["walls"].push([this.startCoord[0], this.startCoord[1] + 1]);
    }

    let index = 0;
    for (const move of moveSpace) {
      index++;
      const moveType = move[0];
      if (overlap) {
        const directionVector = FORCE_DIRECTION_VECTOR[moveType];
        localRoomData["walls"].push([
          xCoord + directionVector[0],
          yCoord + directionVector[1],
        ]); // force the user to go in the moveType direction
      }

      const length = move[1] - (overlap ? 1 : 0);
      const moveVector = MOVE_TO_VECTOR[moveType];
      for (let i = 0; i < length; i++) {
        xCoord += moveVector[0];
        yCoord += moveVector[1];

        if (foodLeft > 0) {
          localRoomData["food"].push([xCoord, yCoord]);
          foodLeft--;
        }
      }

      if (!this.sameOutput && index === moveSpace.length) {
        for (let i = 0; i < 2; i++) {
          xCoord += moveVector[0];
          yCoord += moveVector[1];
        } // 2 is min value to avoid the wall
        this.outCoord = [
          (MOVE_TO_VECTOR[this.outputDirection][0] * minHorizontalSpace) / 2,
          moveVector[1] * yCoord,
        ];
      }

      localRoomData["walls"].push([
        xCoord + moveVector[0],
        yCoord + moveVector[1],
      ]); // stop the movement in the current direction

      if (!overlap) overlap = true;
    }
    if (
      countMoves(this.moves)[OPOSITE[this.moves[this.moves.length - 2]]] === 0
    ) {
      const moveVector =
        FORCE_DIRECTION_VECTOR[this.moves[this.moves.length - 1]];
      localRoomData["walls"].push([
        xCoord + moveVector[0],
        yCoord + moveVector[1],
      ]); // stop the movement in the last dirrection if its not forced yet

      this.outCoord = [xCoord, yCoord];
    }

    console.log(this.startCoord, this.outCoord);
    return localRoomData;
  }
}
