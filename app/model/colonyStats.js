/**
 * Class which contains more stats regarding the evolution of ants.
 */
class ColonyStats {
  /**
   * @param index {number} the colony index
   * @param numberOfAnts {number} the initial number of ants
   */
  constructor(index, numberOfAnts) {
    this.index = index
    this.numberOfAnts = numberOfAnts
    this.numberOfDeadAnts = 0
    this.food = 0
    this.totalFood = 0
    this.foodPheromones = 0
    this.homePheromones = 0
  }

  /**
   * Stores food.
   * @param quantity {number} the amount of food to be stored.
   */
  storeFood(quantity = 1) {
    this.food += quantity
    this.totalFood += quantity
    //console.log('total food', this.totalFood)
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
    this.numberOfAnts -= 1
    this.numberOfDeadAnts += 1
  }

  /**
   * Signals the born of a new ant.
   */
  antBorn() {
    this.numberOfAnts += 1
  }
}
