class Simulation {
  constructor(simulationConfig, drawingConfig) {
    console.log(`Simulation configuration: ${JSON.stringify(simulationConfig, undefined, 2)}`);

    this.simulationConfig = simulationConfig;
    this.drawingConfig = drawingConfig;

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
      const newHome = this._getRandomCell();
      newHome.type = CellType.HOME;
      this.homes.push(newHome);
    }
  }

  _initAnts() {
    console.log('Initializing ants');
    this.ants = [];
    for (let colony = 0; colony < this.simulationConfig.numberOfColonies; colony++) {
      this.ants.push([]);
      const home = this.homes[colony];
      for (let ant = 0; ant < this.simulationConfig.antsPerColony; ant++) {
        this.ants[colony].push(new Ant(home.x, home.y, this));
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

  _getRandomColorString() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
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
    this.ants.forEach(colony => {
      colony.forEach(ant => {
        const currentCell = this.getCell(ant.x, ant.y);
        if (ant.isDead) {
          //TODO
          console.log('DEAD ANT');
        } else if (ant.carryingFood) {
          const forwardDirectionsStraight = ant.forwardDirections()[1];
          const forwardCell = this.getCell(ant.x + forwardDirectionsStraight.x, ant.y + forwardDirectionsStraight.y);

          if (forwardCell === null) {
            ant.randomizeDirection();
          } else if (forwardCell.type === CellType.HOME) {
            console.log('Ant dropped home FOOD!');
            ant.carryingFood = false;
            ant.turnAround();
            ant.searchForFood();
          } else {
            ant.searchForHome();
          }
        } else {
          const forwardDirectionsStraight = ant.forwardDirections()[1];
          const forwardCell = this.getCell(ant.x + forwardDirectionsStraight.x, ant.y + forwardDirectionsStraight.y);

          if (forwardCell === null) {
            ant.randomizeDirection();
          } else if (forwardCell.type === CellType.FOOD) {
            console.log('Ant picked up FOOD!');
            ant.carryingFood = true;
            ant.turnAround();
            this.clearFood(forwardCell);
            ant.searchForHome();
          } else {
            ant.searchForFood();
          }
        }
        if (!ant.isDead && (ant.x !== currentCell.x || ant.y !== currentCell.y)) {
          if (ant.carryingFood) {
            currentCell.pheromones.food += 1;
          } else {
            currentCell.pheromones.home += 1;
          }
        }
      });
    });

    this.cells.forEach(row => {
      row.forEach(cell => {
        if (cell.pheromones.home > 0) {
          cell.pheromones.home *= this.simulationConfig.homePheromoneDecay;
        }
        if (cell.pheromones.food > 0) {
          cell.pheromones.food *= this.simulationConfig.foodPheromoneDecay;
        }
      })
    })
  }

  draw() {
    background(this.drawingConfig.backgroundColor);
    noStroke();

    this.homes.forEach((home, index) => {
      fill(this.colonyColors[index]);
      ellipse(home.x, home.y, this.drawingConfig.homeSize.X, this.drawingConfig.homeSize.Y);
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
        rect(ant.x, ant.y, this.drawingConfig.antSize.X, this.drawingConfig.antSize.Y);
      })
    });

    fill(this.drawingConfig.foodColor);
    this.foods.forEach(foodCell => {
      rect(foodCell.x, foodCell.y, this.drawingConfig.foodSize.X, this.drawingConfig.foodSize.Y);
    });
  }
}
