const COLORS = {
  HOME_COLOR: '#31536b',
  FOOD_COLOR: '#75b8c8',
  BACKGROUND_COLOR: '#e6f5f2',
  ANT_COLOR: '#272725',
  DEAD_ANT_COLOR: '#dd0214',
  ANT_WITH_FOOD: '#14f43c'
};

const SIZES = {
  HOME: {
    X: 7,
    Y: 7,
  },
  ANT: {
    X: 2,
    Y: 2,
  },
  FOOD: {
    X: 1,
    Y: 1,
  }
};

class Simulation {
  constructor(width, height, numberOfColonies, antsPerColony, gameSpeed, foodStacksCount, foodStackSize) {
    console.log(`Initializing Simulation width=${width} height=${height} 
    numberOfColonies=${numberOfColonies} antPerColony=${antsPerColony}`);

    this.width = width;
    this.height = height;
    this.numberOfColonies = numberOfColonies;
    this.antPerColony = antsPerColony;
    this.gameSpeed = gameSpeed;
    this.foodStacksCount = foodStacksCount;
    this.foodStackSize = foodStackSize;

    this._initCells();
    this._initHomes();
    this._initAnts();
    this._initColoniesColors();
    this._initFoodStacks();

    console.log('Simulation initialization complete!');
  }

  _initHomes() {
    console.log('Initializing homes');
    this.homes = [];
    for (let colony = 0; colony < this.numberOfColonies; colony++) {
      const xHome = 1 + int(Math.random() * this.width);
      const yHome = 1 + int(Math.random() * this.height);
      const newHome = new Cell(xHome, yHome);
      newHome.type = CellType.HOME;
      this.homes.push(newHome);
    }
  }

  _initCells() {
    console.log('Initializing cells');
    this.cells = [];
    for (let x = 0; x < this.width; x++) {
      let row = [];
      for (let y = 0; y < this.height; y++) {
        row.push(new Cell(x, y));
      }
      this.cells.push(row);
    }
  }

  _initAnts() {
    console.log('Initializing ants');
    this.ants = [];
    for (let colony = 0; colony < this.numberOfColonies; colony++) {
      this.ants.push([]);
      const home = this.homes[colony];
      for (let ant = 0; ant < this.antPerColony; ant++) {
        this.ants[colony].push(new Ant(home.x, home.y));
      }
    }
  }

  _initColoniesColors() {
    this.colonyColors = [];
    for (let colony = 0; colony < this.numberOfColonies; colony++) {
      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      this.colonyColors.push(randomColor);
    }
  }

  _initFoodStacks() {
    console.log('Initializing food stacks');
    this.foods = [];
    for (let food = 0; food < this.foodStacksCount; food++) {
      const xFood = 1 + int(Math.random() * this.width);
      const yFood = 1 + int(Math.random() * this.height);
      for (let x = xFood; x < xFood + this.foodStackSize && x < this.width; x++) {
        for (let y = yFood; y < yFood + this.foodStackSize && y < this.height; y++) {
          const currentCell = this.cells[x][y];
          currentCell.type = CellType.FOOD;
          this.foods.push(currentCell);
        }
      }
    }
  }

  run() {
    this.ants.forEach(colony => {
      colony.forEach(ant => {
        ant.moveRandomly(this.gameSpeed);
      })
    })
  }

  draw() {
    background(COLORS.BACKGROUND_COLOR);
    noStroke();

    this.homes.forEach((home, index) => {
      fill(this.colonyColors[index]);
      ellipse(home.x, home.y, SIZES.HOME.X, SIZES.HOME.Y);
    });

    this.ants.forEach((colony, index) => {
      colony.forEach((ant) => {
        let antColor = this.colonyColors[index];
        if (ant.isDead) {
          antColor = COLORS.DEAD_ANT_COLOR;
        } else if (ant.carryingFood) {
          antColor = COLORS.ANT_WITH_FOOD;
        }
        fill(antColor);
        rect(ant.x, ant.y, SIZES.ANT.X, SIZES.ANT.Y);
      })
    });

    fill(COLORS.FOOD_COLOR);
    this.foods.forEach(foodCell => {
      rect(foodCell.x, foodCell.y, SIZES.FOOD.X, SIZES.FOOD.Y);
    });
  }
}
