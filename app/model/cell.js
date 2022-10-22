const CellType = {
  EMPTY: 0,
  FOOD: 1,
  HOME: 2,
  WALL: 3,
}

class Cell {
  constructor(x, y, maxPheromone) {
    this.x = x
    this.y = y
    this.type = CellType.EMPTY
    this.maxPheromone = maxPheromone
    this.pheromones = new Pheromones()
  }

  // added general method for adding
  /**
   * Adds pheromone to the cell.
   * @param value {number} the amount of food pheromone.
   * @param colony {number} the colony index of the pheromone.
   */
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
  /**
   * Retrieves the pheromones for a given colony.
   * @param colony {number} the index of the colony.
   * @return {number} the food pheromones amount.
   */
  getPheromone(key, colony) {
    /*if (!this.pheromones[key])
      {
        console.log('ERROR no',key)
        return 0
      }*/
    if (key == 'food' && this.type == CellType.FOOD ||
    key == 'home' && this.type == CellType.HOME)
    {
      if (key == 'food') console.log('FOOD',this.maxPheromone)
     return this.maxPheromone
    }
    const pheromone = this.pheromones[key][colony]
    if (pheromone === undefined) {
      return 0
    }
    return pheromone
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
