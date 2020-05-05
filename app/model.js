class Ant {
  constructor(x, y, colony, simulation, colonyStats, health, hungerSpeed, starveSpeed, healingSpeed, lifeSpan) {
    this.simulation = simulation;
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.colony = colony;
    this.colonyStats = colonyStats;
    this.carryingFood = false;
    this.isDead = false;
    this.health = health;
    this.maxHealth = health;
    this.hungerSpeed = hungerSpeed;
    this.angle = 0;
    this.directions = [
      {x: 0, y: -1},
      {x: 1, y: -1},
      {x: 1, y: 0},
      {x: 1, y: 1},
      {x: 0, y: 1},
      {x: -1, y: 1},
      {x: -1, y: 0},
      {x: -1, y: -1}
    ];
    this.starveSpeed = starveSpeed;
    this.healingSpeed = healingSpeed;
    this.lifeSpan = lifeSpan;
    this.age = 0;
  }

  /**
   * Executes one tick move for the ant.
   */
  move() {
    if (this.isDead) {
      return;
    }

    const forwardDirection = this.forwardDirections()[1];
    const forwardCell = simulation.getCell(this.x + forwardDirection.x, this.y + forwardDirection.y);
    if (forwardCell === null) {
      this.randomizeDirection();
      return;
    }

    if (this.carryingFood && forwardCell.type === CellType.HOME) {
      this.carryingFood = false;
      this.simulation.storeFood(this.colony, this.carryingCapacity);
      this.turnAround();
    } else if (!this.carryingFood && forwardCell.type === CellType.FOOD) {
      this.carryingFood = true;
      this.simulation.clearFood(forwardCell);
      this.turnAround();
    }

    this.seek(!this.carryingFood);
  }

  /**
   * Returns the direction given by the current angle.
   * @return {{x: number, y: number}}
   */
  forward() {
    return this.directions[this.angle];
  }

  /**
   * Returns the forward 3 direction based on the current angle (left-forward, forward, right-forward).
   * @return [fwdLeft: {x: number, y: number}, fwd: {x: number, y: number}, fwdRight: {x: number, y: number}]
   */
  forwardDirections() {
    const fwd = this.directions[this.angle];
    const i = this.angle;
    const fwdLeft = this.directions[i > 0 ? i - 1 : this.directions.length - 1];
    const fwdRight = this.directions[(i + 1) % this.directions.length];

    return [fwdLeft, fwd, fwdRight];
  }

  /**
   * Changes the current angle with one position to left.
   */
  turnLeft() {
    this.angle -= 1;
    if (this.angle < 0) {
      this.angle = this.directions.length - 1;
    }
  }

  /**
   * Executes a 45 degree right turn.
   */
  turnRight() {
    this.angle += 1;
    this.angle = this.angle % this.directions.length;
  }

  /**
   * Executes a 180 degree turn.
   */
  turnAround() {
    for (let i = 0; i < 4; i++) {
      this.turnRight();
    }
  }

  /**
   *  Selects a random direction.
   */
  randomizeDirection() {
    this.angle = floor(random(0, this.directions.length));
  }

  /**
   * Two possible moves:
   * - moved ahead
   * - changes direction to left or right
   * See simulation.probabilityConfig for probability details
   */
  moveRandomly() {
    let fwd = this.forward();
    let probability = Math.random();
    if (probability < simulation.config.probabilities.maintainDirectionOnRandom) {
      this.x += fwd.x * simulation.config.gameSpeed;
      this.y += fwd.y * simulation.config.gameSpeed;
    } else if (probability < simulation.config.probabilities.turnLeftOnRandom) {
      this.turnLeft();
    } else {
      this.turnRight();
    }
  }

  /**
   * Determines which is the best direction for the Ant. If best direction
   * is ahead it moves, if not it changes its direction until the best
   * direction is ahead.
   * @param lookingForFood - if true then best direction is given by food positions, else by home position
   */
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

    if (maxScore < this.simulation.config.probabilities.minScoreLimit
      || Math.random() < this.simulation.config.probabilities.moveRandomWhileSeeking) {
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

  /**
   * Calculates a score for a given direction and based on the ant's purpose.
   * The higher the score the better the direction.
   * @param direction {{x: number, y: number}}
   * @param lookingForFood {boolean}
   * @return {number}
   */
  getScoreForDirection(direction, lookingForFood) {
    const range = simulation.config.ants.sightRange;
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

  /**
   * Calculates the score for a cell based on the ant's purpose.
   * @param cell {Cell}
   * @param lookingForFood {boolean}
   * @return {number}
   */
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

  /**
   * Checks if the colony has food in order to eat or to starve to death.
   * If the and is dead, nothing happens.
   */
  eatFood() {
    if (this.isDead) {
      return;
    }

    // Todo: see
    const currentHunger = Math.random() * 2 * this.hungerSpeed;
    const currentStarving = Math.random() * 2 * this.starveSpeed;

    if (this.colonyStats.food > currentHunger) {
      this.health = min(this.maxHealth, this.health + this.healingSpeed);
      this.colonyStats.food -= currentHunger;
    } else {
      this.health = max(0, this.health - currentStarving);
      if (this.health === 0) {
        this.isDead = true;
        this.colonyStats.antDied();
      }
    }
  }

  aging() {
    if (this.isDead) {
      return;
    }

    this.age++;
    if (this.age >= this.lifeSpan) {
      this.isDead = true;
      this.colonyStats.antDied();
    }
  }
}

class Pheromones {
  constructor() {
    this.food = {};
    this.home = {};
  }

  /**
   * Checks if there is any pheromone left.
   * @return {boolean} true if there is any pheromone, false otherwise.
   */
  hasAnyPheromones() {
    for (let foodKey in this.food) {
      if (this.food[foodKey] > 0.01) {
        return true;
      }
    }
    for (let homeKey in this.home) {
      if (this.home[homeKey] > 0.01) {
        return true;
      }
    }
    return false;
  }
}

const CellType = {
  EMPTY: 0,
  FOOD: 1,
  HOME: 2,
  WALL: 3
}

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.type = CellType.EMPTY;
    this.pheromones = new Pheromones();
  }

  /**
   * Adds food pheromone to the cell.
   * @param value {number} the amount of food pheromone.
   * @param colony {number} the colony index of the pheromone.
   */
  addFoodPheromone(value, colony) {
    if (!this.pheromones.food[colony]) {
      this.pheromones.food[colony] = 0.0;
    }
    this.pheromones.food[colony] += value;
  }

  /**
   * Adds home pheromone to the cell.
   * @param value {number} the amount of home pheromone.
   * @param colony {number} the colony index of the pheromone.
   */
  addHomePheromone(value, colony) {
    if (!this.pheromones.home[colony]) {
      this.pheromones.home[colony] = 0.0;
    }
    this.pheromones.home[colony] += value;
  }

  /**
   * Decays (decreases) the pheromone levels.
   * @param foodDecay {number} the decay for food pheromones.
   * @param homeDecay {number} the decay for home pheromones.
   */
  decayPheromones(foodDecay, homeDecay) {
    for (let key in this.pheromones.food) {
      this.pheromones.food[key] *= foodDecay;
    }
    for (let key in this.pheromones.home) {
      this.pheromones.home[key] *= homeDecay;
    }
  }

  /**
   * Retrieves the food pheromones for a given colony.
   * @param colony {number} the index of the colony.
   * @return {number} the food pheromones amount.
   */
  getFoodPheromone(colony) {
    const pheromone = this.pheromones.food[colony];
    if (pheromone === undefined) {
      return 0;
    }
    return pheromone;
  }

  /**
   * Retrieves the home pheromones for a given colony.
   * @param colony {number} the index of the colony.
   * @return {number} the food pheromones amount.
   */
  getHomePheromone(colony) {
    const pheromone = this.pheromones.home[colony];
    if (pheromone === undefined) {
      return 0;
    }
    return pheromone;
  }

  /**
   * Checks if there are any pheromones in the cell.
   * @return {boolean} true if any pheromone exist, false otherwise.
   */
  hasAnyPheromones() {
    return this.pheromones.hasAnyPheromones();
  }
}

/**
 * Class which contains more stats regarding the evolution of ants.
 */
class ColonyStats {

  /**
   * @param index {number} the colony index
   * @param numberOfAnts {number} the initial number of ants
   */
  constructor(index, numberOfAnts) {
    this.index = index;
    this.numberOfAnts = numberOfAnts;
    this.numberOfDeadAnts = 0;
    this.food = 0;
  }

  /**
   * Stores food.
   * @param quantity {number} the amount of food to be stored.
   */
  storeFood(quantity = 1) {
    this.food += quantity;
  }

  /**
   * Food is eaten by the colony based on the hunger speed.
   */
  eatFood() {
    //this.food = max(0, this.food - int(this.numberOfAnts * this.hungerSpeed));
  }

  /**
   * Signals the death of an ant.
   */
  antDied() {
    this.numberOfAnts -= 1;
    this.numberOfDeadAnts += 1;
  }

  /**
   * Signals the born of a new ant.
   */
  antBorn() {
    this.numberOfAnts += 1;
  }
}

/**
 * Class containing the charts to be displayed.
 */
class UiComponents {
  constructor(statsDiv, debugDiv, audioContainers) {
    this.statsDiv = statsDiv;
    this.debugDiv = debugDiv;
    this.audioContainers = audioContainers;
  }
}
