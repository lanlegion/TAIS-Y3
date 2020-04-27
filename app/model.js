class SimulationConfig {
  constructor(
    mapWidth,
    mapHeight,
    fps,
    numberOfColonies,
    antsPerColony,
    numberOfFoodStacks,
    foodStackSize,
    gameSpeed,
    foodPheromoneDecay,
    homePheromoneDecay,
    antRange
  ) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.fps = fps;
    this.numberOfColonies = numberOfColonies;
    this.antsPerColony = antsPerColony;
    this.numberOfFoodStacks = numberOfFoodStacks;
    this.foodStackSize = foodStackSize;
    this.gameSpeed = gameSpeed;
    this.foodPheromoneDecay = foodPheromoneDecay;
    this.homePheromoneDecay = homePheromoneDecay;
    this.antRange = antRange;
  }
}

class DrawingConfig {
  constructor(
    homeColor,
    foodColor,
    backgroundColor,
    antColor,
    deadAntColor,
    antWithFoodColor,
    homeSize,
    antSize,
    foodSize
  ) {
    this.homeColor = homeColor;
    this.foodColor = foodColor;
    this.backgroundColor = backgroundColor;
    this.antColor = antColor;
    this.deadAntColor = deadAntColor;
    this.antWithFoodColor = antWithFoodColor;
    this.homeSize = homeSize;
    this.antSize = antSize;
    this.foodSize = foodSize;
  }
}

class ProbabilityConfig {
  constructor(
    maintainDirectionOnRandom,
    moveRandomWhileSeeking,
    minScoreLimit
  ) {
    this.maintainDirectionOnRandom = maintainDirectionOnRandom;
    this.turnLeftOnRandom = maintainDirectionOnRandom + (1 - maintainDirectionOnRandom) / 2;
    this.moveRandomWhileSeeking = moveRandomWhileSeeking;
    this.minScoreLimit = minScoreLimit;
  }
}

class Ant {
  constructor(x, y, colony, simulation) {
    this.x = x;
    this.y = y;
    this.colony = colony;
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
    let probability = Math.random();
    if (probability < simulation.probabilityConfig.maintainDirectionOnRandom) {
      this.x += fwd.x * simulation.simulationConfig.gameSpeed;
      this.y += fwd.y * simulation.simulationConfig.gameSpeed;
    } else if (probability < simulation.probabilityConfig.turnLeftOnRandom) {
      this.turnLeft();
    } else {
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

    if (maxScore < this.simulation.probabilityConfig.minScoreLimit
      || Math.random() < this.simulation.probabilityConfig.moveRandomWhileSeeking) {
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
    const range = simulation.simulationConfig.antRange;
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
          return cell.getFoodPheromone(this.colony);
        }
      } else {
        if (cell.type === CellType.HOME) {
          return 100;
        } else {
          return cell.getHomePheromone(this.colony);
        }
      }
    }
  }
}

class Pheromones {
  constructor() {
    this.food = {};
    this.home = {};
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

  addFoodPheromone(value, colony) {
    if (!this.pheromones.food.hasOwnProperty(colony)) {
      this.pheromones.food[colony] = 0.0;
    }
    this.pheromones.food[colony] += value;
  }

  addHomePheromone(value, colony) {
    if (!this.pheromones.home.hasOwnProperty(colony)) {
      this.pheromones.home[colony] = 0.0;
    }
    this.pheromones.home[colony] += value;
  }

  decayPheromones(foodDecay, homeDecay) {
    Object.keys(this.pheromones.food).forEach(key => {
      this.pheromones.food[key] *= foodDecay;
    });
    Object.keys(this.pheromones.home).forEach(key => {
      this.pheromones.home[key] *= homeDecay;
    });
  }

  getFoodPheromone(colony) {
    const pheromone = this.pheromones.food[colony];
    if (pheromone === undefined) {
      return 0;
    }
    return pheromone;
  }

  getHomePheromone(colony) {
    const pheromone = this.pheromones.home[colony];
    if (pheromone === undefined) {
      return 0;
    }
    return pheromone;
  }
}
