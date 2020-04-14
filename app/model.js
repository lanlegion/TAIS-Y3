class Ant {
  constructor(x, y, simulation) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.carryingFood = false;
    this.isDead = false;
    this.simulation = simulation;

    this.angle = 0;
    this.directions = [
      {x: 0, y: -1}, //N
      {x: 1, y: -1}, //NE
      {x: 1, y: 0},  //E
      {x: 1, y: 1},  //SE
      {x: 0, y: 1},  //S
      {x: -1, y: 1}, //SW
      {x: -1, y: 0}, //W
      {x: -1, y: -1} //NW
    ];

  }

  forward() {
    return this.directions[this.angle];
  }

  /**
   * @return [left forward cell, forward cell, right forward cell]
   */
  forwardDirections() {
    const fwd = this.directions[this.angle];
    const i = this.angle;
    const fwdLeft = this.directions[i > 0 ? i - 1 : this.directions.length - 1];
    const fwdRight = this.directions[(i + 1) % this.directions.length];

    return [fwdLeft, fwd, fwdRight];
  }

  turnLeft() {
    this.angle -= 1;
    if (this.angle < 0) {
      this.angle = this.directions.length - 1;
    }
  }

  turnRight() {
    this.angle += 1;
    this.angle = this.angle % this.directions.length;
  }

  turnAround() {
    for (let i = 0; i < 4; i++) {
      this.turnRight();
    }
  }

  randomizeDirection() {
    this.angle = floor(random(0, this.directions.length));
  }

  moveRandomly() {
    let fwd = this.forward();
    let action = floor(random(0, 6));
    //Slightly more likely to move forwards than to turn
    if (action < 4) {
      this.x += fwd.x * simulation.gameSpeed;
      this.y += fwd.y * simulation.gameSpeed;
    } else if (action === 4) {
      this.turnLeft();
    } else if (action === 5) {
      this.turnRight();
    }
  }

  searchForFood() {
    this.seek(true);
  }

  searchForHome() {
    this.seek(false);
  }

  seek(lookingForFood) {
    const forwardDirections = this.forwardDirections();
    let maxScore = 0;
    let bestDirection = forwardDirections[1];

    forwardDirections.forEach(direction => {
      const score = this.getScoreForDirection(direction, lookingForFood);
      if (score > maxScore) {
        maxScore = score;
        bestDirection = direction;
      }
    });

    if (maxScore < 0.01 || random(1) < 0.2) {
      this.moveRandomly();
    } else if (bestDirection === forwardDirections[0]) {
      this.turnLeft();
    } else if (bestDirection === forwardDirections[2]) {
      this.turnRight();
    } else {
      this.x += bestDirection.x;
      this.y += bestDirection.y;
    }
  }

  getScoreForDirection(direction, lookingForFood) {
    const range = simulation.antRange;
    const x0 = this.x + direction.x * range;
    const y0 = this.y + direction.y * range;
    let score = 0;
    for (let x = x0 - range / 2; x <= x0 + (range / 2); x++) {
      for (let y = y0 - (range / 2); y <= y0 + (range / 2); y++) {
        const cell = this.simulation.getCell(round(x), round(y));
        let wScore = this.getScoreForCell(cell, lookingForFood);
        wScore /= (dist(x0, y0, x, y) + 1); //This is the bit that's probably wrong
        score += wScore;
      }
    }

    let fwdCell = this.simulation.getCell(round(this.x + direction.x), round(this.y + direction.y));
    score += this.getScoreForCell(fwdCell, lookingForFood);
    return score;
  }

  getScoreForCell(cell, lookingForFood) {
    if (cell == null) {
      return 0;
    } else {
      if (lookingForFood) {
        if (cell.type === CellType.FOOD) {
          return 100;
        } else {
          return cell.pheromones.food;
        }
      } else {
        if (cell.type === CellType.HOME) {
          return 100;
        } else {
          return cell.pheromones.home;
        }
      }
    }
  }
}


class Pheromones {
  constructor(food = 0, home = 0) {
    this.food = food;
    this.home = home;
  }
}

const CellType = {
  EMPTY: 0,
  FOOD: 1,
  HOME: 2,
  WALL: 3
};


class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.type = CellType.EMPTY;
    this.pheromones = new Pheromones();
  }
}
