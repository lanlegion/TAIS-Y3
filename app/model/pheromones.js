class Pheromones {
  constructor() {
    this.food = {}
    this.home = {}
    this.danger = {}
    this.useDanger = ANT_SIM_CONFIG.pheromones.useDanger
    this.existingLimit = ANT_SIM_CONFIG.pheromones.existingLimit
  }

  /**
   * Checks if there is any pheromone left.
   * @return {boolean} true if there is any pheromone, false otherwise.
   */
  hasAnyPheromones() {
    for (let foodKey in this.food) {
      if (this.food[foodKey] > this.existingLimit) {
        return true
      }
    }
    for (let homeKey in this.home) {
      if (this.home[homeKey] > this.existingLimit) {
        return true
      }
    }
    // extra pheromone
    for (let dangerKey in this.danger) {
      if (this.danger[dangerKey] > this.existingLimit) {
        return true
      }
    }
    //console.log('no pheromones')
    return false
  }

  /**
   * Removes the almost empty pheromones.
   * @return {{food: number, home: number}} - the number of food and home pheromones which were cleaned.
   */
  clean() {
    let homeCleanedPerColony = 0
    let foodCleanedPerColony = 0
    let dangerCleanedPerColony = 0
    for (let foodKey in this.food) {
      if (this.food[foodKey] <= this.existingLimit) {
        delete this.food[foodKey]
        foodCleanedPerColony++
      }
    }
    for (let homeKey in this.home) {
      if (this.home[homeKey] <= this.existingLimit) {
        delete this.home[homeKey]
        homeCleanedPerColony++
      }
    }
    // added danger pheromone
    for (let dangerKey in this.danger) {
      if (this.home[dangerKey] <= this.existingLimit) {
        delete this.home[dangerKey]
        dangerCleanedPerColony++
      }
    }
    return {
      food: foodCleanedPerColony,
      home: homeCleanedPerColony,
      danger: dangerCleanedPerColony,
    }
  }
}
