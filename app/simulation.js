class Simulation {
  constructor(config, uiComponents, charts) {
    console.log(`Simulation config: ${JSON.stringify(config, undefined, 2)}`);

    this.config = config;
    this.uiComponents = uiComponents;
    this.charts = charts;
    this.chartsCache = {
      food: [],
      health: []
    }

    this.tick = 0;

    let occupiedCells = new Set();
    this._initCells();
    this._initHomes(occupiedCells);
    this._initAnts();
    this._initColoniesColors();
    this._initFoodStacks(occupiedCells);

    console.log('Simulation initialization complete!');
  }

  _initCells() {
    console.log('Initializing cells');
    this.cells = [];
    this.pheromoneCells = new Set();
    for (let x = 0; x < this.config.map.width; x++) {
      let row = [];
      for (let y = 0; y < this.config.map.height; y++) {
        row.push(new Cell(x, y));
      }
      this.cells.push(row);
    }
  }

  _initHomes(occupiedCells) {
    console.log('Initializing homes');
    this.homes = [];
    for (let colony = 0; colony < this.config.ants.numberOfColonies; colony++) {
      let colonyHomes = [];
      this._gatRandomSquareLocations().forEach(cell => {
        if (!occupiedCells.has(`${cell.x}-${cell.y}`)) {
          occupiedCells.add(`${cell.x}-${cell.y}`);
          cell.type = CellType.HOME;
          colonyHomes.push(cell);
        }
      });
      this.homes.push(colonyHomes);
    }
  }

  randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  _randomAntExpectancy() {
    return this.randomIntFromInterval(
      this.config.ants.averageLifeSpan - this.config.ants.lifeSpanDeviation,
      this.config.ants.averageLifeSpan + this.config.ants.lifeSpanDeviation);
  }

  _initAnts() {
    console.log('Initializing ants');
    this.ants = [];
    this.colonies = [];
    for (let colony = 0; colony < this.config.ants.numberOfColonies; colony++) {
      const colonyStats = new ColonyStats(colony, this.config.ants.antsPerColony)
      this.colonies.push(colonyStats);
      this.ants.push([]);
      for (let ant = 0; ant < this.config.ants.antsPerColony; ant++) {
        const initialPosition = this._getInitialPositionForAnt(colony);
        this.ants[colony].push(
          new Ant(
            initialPosition.x,
            initialPosition.y,
            colony,
            this,
            colonyStats,
            this.config.ants.maxHealth,
            this.config.food.antHunger,
            this.config.food.starveSpeed,
            this.config.food.healingSpeed,
            this._randomAntExpectancy()));
      }
    }
  }

  _initColoniesColors() {
    console.log('Initializing colonies colors');
    this.colonyColors = [];
    for (let colony = 0; colony < this.config.ants.numberOfColonies; colony++) {
      this.colonyColors.push(this.config.map.colors.colony[colony]);
    }
  }

  _initFoodStacks(occupiedCells) {
    console.log('Initializing food stacks');
    this.foods = [];
    for (let food = 0; food < this.config.food.numberOfFoodStacks; food++) {
      const randomLocation = this._getRandomLocationOnMap();
      for (let x = randomLocation.x;
           x < randomLocation.x + this.config.food.foodStackSize && x < this.config.map.width; x++) {
        for (let y = randomLocation.y;
             y < randomLocation.y + this.config.food.foodStackSize && y < this.config.map.height; y++) {

          if (occupiedCells.has(`${x}-${y}`)) {
            continue;
          }
          occupiedCells.add(`${x}-${y}`);
          const currentCell = this.cells[x][y];
          currentCell.type = CellType.FOOD;
          this.foods.push(currentCell);
        }
      }
    }
  }

  /**
   * Retrieves a random Cell from the map.
   * @return {Cell} the random cell.
   * @private
   */
  _getRandomCell() {
    const randomLocation = this._getRandomLocationOnMap();
    return this.getCell(randomLocation.x, randomLocation.y);
  }

  /**
   * Retrieves a random position on the map.
   * @return {{x: number, y: number}} the random position.
   * @private
   */
  _getRandomLocationOnMap() {
    return {
      x: 1 + int(Math.random() * this.config.map.width),
      y: 1 + int(Math.random() * this.config.map.height)
    }
  }

  /**
   * Retrieves a random square (multiple adjacent cells) from the map.
   * @param sizes {{x: number, y: number}} the dimensions of the square.
   * @return [Cell] the list of random Cells
   * @private
   */
  _gatRandomSquareLocations(sizes = {x: 10, y: 10}) {
    let randomCells = [];
    const randomLocation = this._getRandomLocationOnMap();
    for (let x = randomLocation.x; x < randomLocation.x + sizes.x; x++) {
      for (let y = randomLocation.y; y < randomLocation.y + sizes.y; y++) {
        const newCell = this.getCell(x, y);
        if (newCell !== null) {
          randomCells.push(newCell);
        }
      }
    }
    return randomCells;
  }

  /**
   * Generates a random color string.
   * @return {string} the color string.
   * @private
   */
  _getRandomColorString() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  /**
   * Generates a pseudo-random initial position for an ant. It will be on one of the
   * colony home cells.
   * @param colony {number} the index of the colony of the ant.
   * @return {{x: number, y: number}} the initial position for the ant.
   * @private
   */
  _getInitialPositionForAnt(colony) {
    const randomHomeCell = this.homes[colony][Math.floor(Math.random() * this.homes[colony].length)];
    return {
      x: randomHomeCell.x,
      y: randomHomeCell.y
    }
  }

  /**
   * Retrieves the cell at a given position.
   * @param x {number}
   * @param y {number}
   * @return {Cell|null} if the x y coordinates are invalid null, the Cell otherwise.
   */
  getCell(x, y) {
    if (x < 0 || x >= this.config.map.width) {
      return null;
    }
    if (y < 0 || y >= this.config.map.height) {
      return null;
    }
    return this.cells[x][y];
  }

  /**
   * Removes the food from a cell (it converts it from a FOOD cell to an EMPTY cell).
   * @param cell {Cell} from where the food should be removed
   */
  clearFood(cell) {
    cell.type = CellType.EMPTY;
    let index = this.foods.indexOf(cell);
    if (index !== -1) {
      this.foods.splice(index, 1);
    }
  }

  /**
   * Stores the food for the colony.
   * @param colony
   * @param quantity
   */
  storeFood(colony, quantity = 1) {
    this.colonies[colony].storeFood(quantity);
  }

  /**
   * Executes one tick of the simulation.
   */
  run() {
    this.tick++;
    this.ants.forEach((colony, index) => {
      let totalColonyHealth = 0;
      colony.forEach(ant => {
        totalColonyHealth += ant.health;
        ant.move();
        ant.eatFood();
        ant.aging();
        this.antLeavesPheromone(ant, this.getCell(ant.x, ant.y))
      });
      this.colonies[index].averageHealth = totalColonyHealth / colony.length;
    });
    this.decayPheromone();
    this.consumeFood();
    this.bornAnts();
    this._updateCharts();
  }

  /**
   * Adds the data from this tick of the simulation to the charts.
   * @private
   */
  _updateCharts() {
    if (this.tick % this.config.charts.intervalPush !== 0) {
      return;
    }

    let foodCurrentStats = [];
    let healthCurrentStats = [];
    let populationCurrentStats = [];
    let deadCurrentStats = [];

    for (let colony = 0; colony < this.colonies.length; colony++) {
      foodCurrentStats.push(this.colonies[colony].food);
      healthCurrentStats.push(this.colonies[colony].averageHealth);
      populationCurrentStats.push(this.colonies[colony].numberOfAnts);
      deadCurrentStats.push(this.colonies[colony].numberOfDeadAnts);
    }

    this.charts.foodChart.pushData(foodCurrentStats, this.tick);
    this.charts.healthChart.pushData(healthCurrentStats, this.tick);
    this.charts.populationChart.pushData(populationCurrentStats, this.tick);
    this.charts.deadChart.pushData(deadCurrentStats, this.tick);
  }

  /**
   * Leaving pheromone from ants based on its activity.
   * @param ant {Ant} the ant which leaves pheromone.
   * @param currentCell {Cell} the cell on which the ant is.
   * @param quantity {number} the quantity of pheromone which is left by the ant.
   */
  antLeavesPheromone(ant, currentCell, quantity = 1) {
    if (currentCell !== null && !ant.isDead) {
      if (ant.carryingFood) {
        currentCell.addFoodPheromone(quantity, ant.colony);
      } else {
        currentCell.addHomePheromone(quantity, ant.colony);
      }
      this.pheromoneCells.add(currentCell);
    }
  }

  /**
   * Decay the pheromones over time.
   */
  decayPheromone() {
    let cellsToDelete = [];
    for (let cell in this.pheromoneCells) {
      cell.decayPheromones(this.config.pheromones.foodDecay, this.config.pheromoneCells.homeDecay);
      if (!cell.hasAnyPheromones()) {
        cellsToDelete.push(cell);
      }
    }
    cellsToDelete.forEach(cell => {
      this.pheromoneCells.delete(cell);
    });
  }

  /**
   * Consume food over time.
   */
  consumeFood() {
    this.colonies.forEach(colony => {
      colony.eatFood();
    });
  }

  bornAnts() {
    let anyAntsBorn = false;
    this.colonies.forEach((colony, index) => {
      if (colony.food > this.config.food.birthsThreshold && this.tick % this.config.ants.bornInterval === 0) {
        this.bornAntsInColony(index, colony);
        anyAntsBorn = true;
      }
    });
    if (this.config.playSounds && anyAntsBorn) {
      this.uiComponents.audioContainers.born.play().catch(reason => {
        console.error(reason);
      });
    }
  }

  bornAntsInColony(colonyId, colony) {
    const fixedBirthValue = int(this.config.ants.bornPopulationPercent * colony.numberOfAnts);
    const numOfNewAnts = this.randomIntFromInterval(
      fixedBirthValue / this.config.ants.bornDeviation,
      fixedBirthValue * this.config.ants.bornDeviation);

    for (let ant = 0; ant < numOfNewAnts; ant++) {
      const initialPosition = this._getInitialPositionForAnt(colonyId);
      const newborn = new Ant(
        initialPosition.x,
        initialPosition.y,
        colonyId,
        this,
        colony,
        this.config.ants.maxHealth,
        this.config.food.antHunger,
        this.config.food.starveSpeed,
        this.config.food.healingSpeed,
        this._randomAntExpectancy());
      this.ants[colonyId].push(newborn);
      colony.antBorn();
    }
  }

  draw() {
    if (this.tick % this.config.drawingTicks !== 0) {
      return;
    }

    background(this.config.map.colors.backgroundColor);
    noStroke();

    if (this.config.map.drawPheromones) {
      fill('rgba(236,142,142,0.48)');
      this.pheromoneCells.forEach(cell => {
        rect(cell.x, cell.y, 1, 1);
      })
    }

    this.homes.forEach((cells, index) => {
      fill(this.colonyColors[index]);
      cells.forEach(cell => {
        rect(cell.x, cell.y, 1, 1);
      });
    });

    this.ants.forEach((colony, index) => {
      colony.forEach((ant) => {
        let antColor = this.colonyColors[index];
        if (ant.isDead) {
          antColor = this.config.map.colors.deadAntColor;
        } else if (ant.carryingFood) {
          antColor = this.config.map.colors.antWithFood;
        }
        fill(antColor);
        rect(ant.x, ant.y, 1, 1);
      })
    });

    fill(this.config.map.colors.foodColor);
    this.foods.forEach(foodCell => {
      rect(foodCell.x, foodCell.y, 1, 1);
    });

    this.uiComponents.statsDiv.html(this.statsHtmlString());
    if (this.config.debug) {
      this.uiComponents.debugDiv.html(this.debugHtmlString());
    }
  }

  statsHtmlString() {
    let prettyString = '';
    this.colonies.forEach((colonyStats, index) => {
      let tempString = `<span style="color:${this.colonyColors[index]}">Colony id: ${colonyStats.index}  `
        + `Food: ${colonyStats.food.toFixed(2)}  `
        + `Alive ants: ${colonyStats.numberOfAnts}  `
        + `Dead ants: ${colonyStats.numberOfDeadAnts}  `
        + `Avg health:  ${colonyStats.averageHealth.toFixed(2)}  `
        + `<br></span>`

      if (colonyStats.numberOfAnts === 0) {
        tempString = '<strike>' + tempString + '</strike>';
      }
      prettyString += tempString;
    });
    return prettyString;
  }

  debugHtmlString() {
    let prettyString = `Tick: ${this.tick}<br>Cells with pheromone in set: ${this.pheromoneCells.size}`;
    return prettyString;
  }
}
