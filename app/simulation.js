class Simulation {
  constructor(simulationConfig, drawingConfig, probabilityConfig, uiComponents) {
    console.log(`Simulation configuration: ${JSON.stringify(simulationConfig, undefined, 2)}`);
    console.log(`Drawing configuration: ${JSON.stringify(drawingConfig, undefined, 2)}`);
    console.log(`Probability configuration: ${JSON.stringify(probabilityConfig, undefined, 2)}`);

    this.simulationConfig = simulationConfig;
    this.drawingConfig = drawingConfig;
    this.probabilityConfig = probabilityConfig;
    this.uiComponents = uiComponents;

    this.tick = 0;

    this._initCells();
    this._initHomes();
    this._initAnts();
    this._initColoniesColors();
    this._initFoodStacks();

    console.log('Simulation initialization complete!');
  }

  _initCells() {
    console.log('Initializing cells');
    this.cells = [];
    this.pheromoneCells = new Set();
    for (let x = 0; x < this.simulationConfig.mapWidth; x++) {
      let row = [];
      for (let y = 0; y < this.simulationConfig.mapHeight; y++) {
        row.push(new Cell(x, y));
      }
      this.cells.push(row);
    }
  }

  _initHomes() {
    console.log('Initializing homes');
    this.homes = [];
    for (let colony = 0; colony < this.simulationConfig.numberOfColonies; colony++) {
      let colonyHomes = [];
      this._gatRandomSquareLocations().forEach(cell => {
        cell.type = CellType.HOME;
        colonyHomes.push(cell);
      });
      this.homes.push(colonyHomes);
    }
  }

  _initAnts() {
    console.log('Initializing ants');
    this.ants = [];
    this.colonies = [];
    for (let colony = 0; colony < this.simulationConfig.numberOfColonies; colony++) {
      this.colonies.push(new ColonyStats(colony, this.simulationConfig.antsPerColony));
      this.ants.push([]);
      for (let ant = 0; ant < this.simulationConfig.antsPerColony; ant++) {
        const initialPosition = this._getInitialPositionForAnt(colony);
        this.ants[colony].push(new Ant(initialPosition.x, initialPosition.y, colony, this));
      }
    }
  }

  _initColoniesColors() {
    console.log('Initializing colonies colors');
    this.colonyColors = [];
    for (let colony = 0; colony < this.simulationConfig.numberOfColonies; colony++) {
      this.colonyColors.push(this._getRandomColorString());
    }
  }

  _initFoodStacks() {
    console.log('Initializing food stacks');
    this.foods = [];
    for (let food = 0; food < this.simulationConfig.numberOfFoodStacks; food++) {
      const randomLocation = this._getRandomLocationOnMap();
      for (let x = randomLocation.x;
           x < randomLocation.x + this.simulationConfig.foodStackSize && x < this.simulationConfig.mapWidth; x++) {
        for (let y = randomLocation.y;
             y < randomLocation.y + this.simulationConfig.foodStackSize && y < this.simulationConfig.mapHeight; y++) {
          const currentCell = this.cells[x][y];
          currentCell.type = CellType.FOOD;
          this.foods.push(currentCell);
        }
      }
    }
  }

  _getRandomCell() {
    const randomLocation = this._getRandomLocationOnMap();
    return this.getCell(randomLocation.x, randomLocation.y);
  }

  _getRandomLocationOnMap() {
    return {
      x: 1 + int(Math.random() * this.simulationConfig.mapWidth),
      y: 1 + int(Math.random() * this.simulationConfig.mapHeight)
    }
  }

  _gatRandomSquareLocations() {
    let randomCells = [];
    const randomLocation = this._getRandomLocationOnMap();
    for (let x = randomLocation.x; x < randomLocation.x + this.drawingConfig.homeSize.x; x++) {
      for (let y = randomLocation.y; y < randomLocation.y + this.drawingConfig.homeSize.y; y++) {
        const newCell = this.getCell(x, y);
        if (newCell !== null) {
          randomCells.push(newCell);
        }
      }
    }
    return randomCells;
  }

  _getRandomColorString() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  _getInitialPositionForAnt(colony) {
    const randomHomeCell = this.homes[colony][Math.floor(Math.random() * this.homes[colony].length)];
    return {
      x: randomHomeCell.x,
      y: randomHomeCell.y
    }
  }

  getCell(x, y) {
    if (x < 0 || x >= this.simulationConfig.mapWidth) {
      return null;
    }
    if (y < 0 || y >= this.simulationConfig.mapHeight) {
      return null;
    }

    return this.cells[x][y];
  }

  clearFood(cell) {
    cell.type = CellType.EMPTY;
    let index = this.foods.indexOf(cell);
    if (index !== -1) {
      this.foods.splice(index, 1);
    }
  }

  run() {
    this.tick++;
    this.ants.forEach(colony => {
      colony.forEach(ant => {
        const currentCell = this.getCell(ant.x, ant.y);
        if (ant.isDead) {
          // Todo: implement
        } else if (ant.carryingFood) {
          this.moveAntTowardsHome(ant);
        } else {
          this.moveAntTowardsFood(ant);
        }
        this.antLeavesPheromone(ant, currentCell)
      });
    });
    this.decayPheromone();
  }

  moveAntTowardsHome(ant) {
    const forwardDirectionsStraight = ant.forwardDirections()[1];
    const forwardCell = this.getCell(ant.x + forwardDirectionsStraight.x, ant.y + forwardDirectionsStraight.y);

    if (forwardCell === null) {
      ant.randomizeDirection();
    } else if (forwardCell.type === CellType.HOME) {
      ant.carryingFood = false;
      this.colonies[ant.colony].food += 1;
      ant.turnAround();
      ant.searchForFood();
    } else {
      ant.searchForHome();
    }
  }

  moveAntTowardsFood(ant) {
    const forwardDirectionsStraight = ant.forwardDirections()[1];
    const forwardCell = this.getCell(ant.x + forwardDirectionsStraight.x, ant.y + forwardDirectionsStraight.y);

    if (forwardCell === null) {
      ant.randomizeDirection();
    } else if (forwardCell.type === CellType.FOOD) {
      ant.carryingFood = true;
      ant.turnAround();
      this.clearFood(forwardCell);
      ant.searchForHome();
    } else {
      ant.searchForFood();
    }
  }

  antLeavesPheromone(ant, currentCell) {
    if (currentCell !== null && !ant.isDead && (ant.x !== currentCell.x || ant.y !== currentCell.y)) {
      if (ant.carryingFood) {
        currentCell.addFoodPheromone(1, ant.colony);
      } else {
        currentCell.addHomePheromone(1, ant.colony);
      }
      this.pheromoneCells.add(currentCell);
    }
  }

  decayPheromone() {
    let cellsToDelete = [];
    for (let cell in this.pheromoneCells) {
      cell.decayPheromones(this.simulationConfig.foodPheromoneDecay, this.simulationConfig.homePheromoneDecay);
      if (!cell.hasAnyPheromones()) {
        cellsToDelete.push(cell);
      }
    }
    cellsToDelete.forEach(cell => {
      this.pheromoneCells.delete(cell);
    });
  }

  draw() {
    background(this.drawingConfig.backgroundColor);
    noStroke();

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
          antColor = this.drawingConfig.deadAntColor;
        } else if (ant.carryingFood) {
          antColor = this.drawingConfig.antWithFoodColor;
        }
        fill(antColor);
        rect(ant.x, ant.y, this.drawingConfig.antSize.x, this.drawingConfig.antSize.y);
      })
    });

    fill(this.drawingConfig.foodColor);
    this.foods.forEach(foodCell => {
      rect(foodCell.x, foodCell.y, this.drawingConfig.foodSize.x, this.drawingConfig.foodSize.y);
    });

    this.uiComponents.statsDiv.html(this.statsHtmlString());
    this.uiComponents.debugDiv.html(this.debugHtmlString());
  }

  statsHtmlString() {
    let prettyString = '';
    this.colonies.forEach((colonyStats, index) => {
      prettyString += `<span style="color:${this.colonyColors[index]}">Colony id: ${colonyStats.index}   Food: ${colonyStats.food} <br></span>`
    });
    return prettyString;
  }

  debugHtmlString() {
    let prettyString = `Cells with pheromone in set: ${this.pheromoneCells.size}`;
    return prettyString;
  }
}
