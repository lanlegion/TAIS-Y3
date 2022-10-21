const CellType = {
  EMPTY: 0,
  FOOD: 1,
  HOME: 2,
  WALL: 3,
}

class Cell {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.type = CellType.EMPTY
    this.pheromones = new Pheromones()
  }

  // added general method for adding
  addPheromone(key, value, valueScale, colony) {
    if (!this.pheromones[key][colony]) {
      this.pheromones[key][colony] = 0.0
    }
    //this.pheromones[key][colony] += value
    // top-off
    this.pheromones[key][colony] = Math.min(
      this.pheromones[key][colony] + valueScale * value,
      value
    )
  }

  // added general method for getting
  getPheromone(key, colony) {
    /*if (!this.pheromones[key])
      {
        console.log('ERROR no',key)
        return 0
      }*/
    const pheromone = this.pheromones[key][colony]
    if (pheromone === undefined) {
      return 0
    }
    return pheromone
  }
  /**
   * Adds food pheromone to the cell.
   * @param value {number} the amount of food pheromone.
   * @param colony {number} the colony index of the pheromone.
   */
  addFoodPheromone(value, colony) {
    if (!this.pheromones.food[colony]) {
      this.pheromones.food[colony] = 0.0
    }
    this.pheromones.food[colony] += value
  }

  /**
   * Adds home pheromone to the cell.
   * @param value {number} the amount of home pheromone.
   * @param colony {number} the colony index of the pheromone.
   */
  addHomePheromone(value, colony) {
    if (!this.pheromones.home[colony]) {
      this.pheromones.home[colony] = 0.0
    }
    this.pheromones.home[colony] += value
  }

  // TODO new danger pheromone
  addDangerPheromone(value, colony) {
    if (!this.pheromones.danger[colony]) {
      this.pheromones.danger[colony] = 0.0
    }
    this.pheromones.danger[colony] += value
    //console.log('added',value,'danger for a total of',this.pheromones.danger[colony])
  }

  /**
   * Decays (decreases) the pheromone levels.
   * @param foodDecay {number} the decay for food pheromones.
   * @param homeDecay {number} the decay for home pheromones.
   * @param dangerDecay {number} the decay for danger pheromones. (added)
   */
  decayPheromones(foodDecay, homeDecay, dangerDecay) {
    for (let key in this.pheromones.food) {
      this.pheromones.food[key] *= foodDecay
    }
    for (let key in this.pheromones.home) {
      this.pheromones.home[key] *= homeDecay
    }
    for (let key in this.pheromones.danger) {
      this.pheromones.danger[key] *= dangerDecay
    }
  }

  /**
   * Retrieves the food pheromones for a given colony.
   * @param colony {number} the index of the colony.
   * @return {number} the food pheromones amount.
   */
  getFoodPheromone(colony) {
    const pheromone = this.pheromones.food[colony]
    if (pheromone === undefined) {
      return 0
    }
    return pheromone
  }

  /**
   * Retrieves the home pheromones for a given colony.
   * @param colony {number} the index of the colony.
   * @return {number} the food pheromones amount.
   */
  getHomePheromone(colony) {
    const pheromone = this.pheromones.home[colony]
    if (pheromone === undefined) {
      return 0
    }
    return pheromone
  }

  // TODO new danger pheromone
  getDangerPheromone(colony) {
    const pheromone = this.pheromones.danger[colony]
    if (pheromone === undefined) {
      return 0
    }
    return pheromone
  }

  /**
   * Checks if there are any pheromones in the cell.
   * @return {boolean} true if any pheromone exist, false otherwise.
   */
  hasAnyPheromones() {
    return this.pheromones.hasAnyPheromones()
  }

  /**
   * Removes the almost empty pheromones.
   * @return {{food: number, home: number}} - the number of food and home pheromones which were cleaned.
   */
  cleanPheromones() {
    return this.pheromones.clean()
  }
}
