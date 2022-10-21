class Ant {
  constructor(
    x,
    y,
    colony,
    simulation,
    colonyStats,
    health,
    hungerSpeed,
    starveSpeed,
    healingSpeed,
    lifeSpan,
    damageHit
  ) {
    this.simulation = simulation
    this.x = x
    this.y = y
    this.angle = 0
    this.colony = colony
    this.colonyStats = colonyStats
    this.carryingFood = false
    this.isDead = false
    this.health = health
    this.maxHealth = health
    this.hungerSpeed = hungerSpeed
    this.angle = 0
    this.directions = [
      { x: 0, y: -1 },
      { x: 1, y: -1 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: -1, y: 1 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
    ]
    this.starveSpeed = starveSpeed
    this.healingSpeed = healingSpeed
    this.lifeSpan = lifeSpan
    this.age = 0
    this.damageHit = damageHit
  }

  /**
   * Executes one tick move for the ant.
   */
  move() {
    if (this.isDead) {
      return
    }

    const currentCell = this.simulation.getCell(this.x, this.y)
    if (this.carryingFood && currentCell.type === CellType.HOME) {
      this.carryingFood = false
      this.simulation.storeFood(this.colony) //, this.carryingCapacity)
      //this.turnAround()
    }
    if (!this.carryingFood && currentCell.type === CellType.FOOD) {
      this.carryingFood = true
      this.simulation.clearFood(currentCell)
      //this.turnAround()
    }

    const forwardDirection = this.forwardDirections()[1]
    const forwardCell = simulation.getCell(
      this.x + forwardDirection.x,
      this.y + forwardDirection.y
    )
    if (forwardCell === null) {
      this.randomizeDirection()
      return
    }

    if (
      this.simulation.antsOnMap[forwardCell.x] !== undefined &&
      this.simulation.antsOnMap[forwardCell.x][forwardCell.y] !== undefined
    ) {
      this.simulation.antsOnMap[forwardCell.x][forwardCell.y].forEach((ant) => {
        if (ant.colony !== this.colony) {
          const currentDamageHit =
            this.damageHit +
            this.colonyStats.food *
              this.simulation.config.ants.extraHitPowerFromFood
          ant.receiveDamage(currentDamageHit)
        }
      })
    }

    if (forwardCell.type == CellType.WALL) {
      // Added obstacle (wall)
      this.turnAround()
      /*} else if (this.carryingFood && forwardCell.type === CellType.HOME) {
              this.carryingFood = false
              this.simulation.storeFood(this.colony, this.carryingCapacity)
              this.turnAround()
            } else if (!this.carryingFood && forwardCell.type === CellType.FOOD) {
              this.carryingFood = true
              this.simulation.clearFood(forwardCell)
              this.turnAround()*/
    }

    this.seek(!this.carryingFood)
  }

  /**
   * Returns the direction given by the current angle.
   * @return {{x: number, y: number}}
   */
  forward() {
    return this.directions[this.angle]
  }

  /**
   * Returns the forward 3 direction based on the current angle (left-forward, forward, right-forward).
   * @return [fwdLeft: {x: number, y: number}, fwd: {x: number, y: number}, fwdRight: {x: number, y: number}]
   */
  forwardDirections() {
    const fwd = this.directions[this.angle]
    const i = this.angle
    const fwdLeft = this.directions[i > 0 ? i - 1 : this.directions.length - 1]
    const fwdRight = this.directions[(i + 1) % this.directions.length]

    return [fwdLeft, fwd, fwdRight]
  }

  /**
   * Changes the current angle with one position to left.
   */
  turnLeft() {
    this.angle -= 1
    if (this.angle < 0) {
      this.angle = this.directions.length - 1
    }
  }

  /**
   * Executes a 45 degree right turn.
   */
  turnRight() {
    this.angle += 1
    this.angle = this.angle % this.directions.length
  }

  /**
   * Executes a 180 degree turn.
   */
  turnAround() {
    for (let i = 0; i < 4; i++) {
      this.turnRight()
    }
  }

  /**
   *  Selects a random direction.
   */
  randomizeDirection() {
    this.angle = floor(random(0, this.directions.length))
  }

  /**
   * Two possible moves:
   * - moved ahead
   * - changes direction to left or right
   * See simulation.probabilityConfig for probability details
   */
  moveRandomly() {
    let fwd = this.forward()
    let probability = Math.random()
    if (
      probability < simulation.config.probabilities.maintainDirectionOnRandom
    ) {
      this.x += fwd.x * simulation.config.gameSpeed
      this.y += fwd.y * simulation.config.gameSpeed
    } else if (probability < simulation.config.probabilities.turnLeftOnRandom) {
      this.turnLeft()
    } else {
      this.turnRight()
    }
  }

  /**
   * Determines which is the best direction for the Ant. If best direction
   * is ahead it moves, if not it changes its direction until the best
   * direction is ahead.
   * @param lookingForFood - if true then best direction is given by food positions, else by home position
   */
  seek(lookingForFood) {
    const forwardDirections = this.forwardDirections()
    let maxScore = 0
    let bestDirection = forwardDirections[1]

    forwardDirections.forEach((direction) => {
      let score = this.getScoreForDirection(direction, lookingForFood)

      /*score +=
        (Math.random - 0.5) *
        simulation.config.probabilities.maintainDirectionOnRandom *
        this.simulation.config.pheromones.maxPheromone*/
      score = Math.random
      if (score > maxScore) {
        maxScore = score
        bestDirection = direction
      }
    })

    /*if (
      maxScore < this.simulation.config.probabilities.minScoreLimit ||
      Math.random() <
        this.simulation.config.probabilities.moveRandomWhileSeeking
    ) {
      this.moveRandomly()
    } else*/ if (bestDirection === forwardDirections[0]) {
      this.turnLeft()
    } else if (bestDirection === forwardDirections[2]) {
      this.turnRight()
    } else {
      this.x += bestDirection.x
      this.y += bestDirection.y
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
    let score = 0
    /*const range = simulation.config.ants.sightRange
    const x0 = this.x + direction.x * range
    const y0 = this.y + direction.y * range
    let score = 0
    for (let x = x0 - range / 2; x <= x0 + range / 2; x++) {
      for (let y = y0 - range / 2; y <= y0 + range / 2; y++) {
        const cell = this.simulation.getCell(round(x), round(y))
        let wScore = this.getScoreForCell(cell, lookingForFood)
        wScore /= dist(x0, y0, x, y) + 1 //This is the bit that's probably wrong
        score += wScore
      }
    }*/

    let fwdCell = this.simulation.getCell(
      round(this.x + direction.x),
      round(this.y + direction.y)
    )
    score += this.getScoreForCell(fwdCell, lookingForFood)
    return score
  }

  /**
   * Calculates the score for a cell based on the ant's purpose.
   * @param cell {Cell}
   * @param lookingForFood {boolean}
   * @return {number}
   */
  getScoreForCell(cell, lookingForFood) {
    if (cell == null) {
      return 0
    }
    // Avoid cells with too many ants
    if (
      Object.entries(this.simulation.antsOnMap).length > 0 &&
      this.simulation.antsOnMap[cell.x] &&
      this.simulation.antsOnMap[cell.x][cell.y] &&
      this.simulation.antsOnMap[cell.x][cell.y].length >=
        this.simulation.config.ants.maxAtLocation
    ) {
      return 0
    }
    if (lookingForFood) {
      /*if (cell.type === CellType.FOOD) {
        return this.config.pheromones.maxPheromone
      } else {*/
      // Avoid danger pheromone when looking for food for now TODO?
      return Math.pow(
        this.simulation.config.selectK +
          (cell.getPheromone('food', this.colony) -
            cell.getPheromone('danger', this.colony)),
        this.simulation.config.selectN
      )
      //}
    } else {
      /*if (cell.type === CellType.HOME) {
        return this.config.pheromones.maxPheromone
      } else {*/
      return Math.pow(
        this.simulation.config.selectK + cell.getPheromone('home', this.colony),
        this.simulation.config.selectN
      )
      //}
    }
  }

  /**
   * Checks if the colony has food in order to eat or to starve to death.
   * If the and is dead, nothing happens.
   */
  eatFood() {
    if (this.isDead) {
      return
    }

    // Todo: see
    const currentHunger = Math.random() * 2 * this.hungerSpeed
    const currentStarving = Math.random() * 2 * this.starveSpeed

    if (this.colonyStats.food > currentHunger) {
      this.health = min(this.maxHealth, this.health + this.healingSpeed)
      this.colonyStats.food -= currentHunger
    } else {
      this.health = max(0, this.health - currentStarving)
      if (this.health === 0) {
        this.isDead = true
        this.colonyStats.antDied()
      }
    }
  }

  /**
   * Advances the ant in age. If it reaches its age limit, it dies.
   */
  aging() {
    if (this.isDead) {
      return
    }

    this.age++
    if (this.age >= this.lifeSpan) {
      this.isDead = true
      this.justDied = true
      this.colonyStats.antDied()
    }
  }

  /**
   * Receives the damage from another ant. If health reaches 0, it dies.
   * @param damageAmount the damage to e received.
   */
  receiveDamage(damageAmount) {
    if (this.isDead) {
      return
    }

    this.health = max(0, this.health - damageAmount)
    if (this.health === 0) {
      this.isDead = true
      this.colonyStats.antDied()
    }
  }
}
