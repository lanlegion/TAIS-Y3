const COLORS = {
  HOME_COLOR: '#31536b',
  FOOD_COLOR: '#75b8c8',
  BACKGROUND_COLOR: '#e6f5f2',
  ANT_COLOR: '#272725',
  DEAD_ANT_COLOR: '#dd0214',
  ANT_WITH_FOOD: '#14f43c'
};

const SIZES = {
  HOME_WIDTH: 7,
  HOME_HEIGHT: 7,
  ANT_WIDTH: 2,
  ANT_HEIGHT: 2,
};

class Simulation {
  constructor(width, height, numberOfColonies, antsPerColony, gameSpeed) {
    console.log(`Initializing Simulation width=${width} height=${height} 
    numberOfColonies=${numberOfColonies} antPerColony=${antsPerColony}`);

    this.width = width;
    this.height = height;
    this.numberOfColonies = numberOfColonies;
    this.antPerColony = antsPerColony;
    this.gameSpeed = gameSpeed;

    this._initHome();
    this._initAnts();
    this._initColoniesColors();

    console.log('Simulation initialization complete!');
  }

  _initHome() {
    console.log('Initializing homes');
    this.homes = [];
    for (let colony = 0; colony < this.numberOfColonies; colony++) {
      const xHome = 1 + Math.random() * this.width;
      const yHome = 1 + Math.random() * this.height;
      const newHome = new Cell(xHome, yHome);
      newHome.type = CellType.HOME;
      this.homes.push(newHome);
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

  run() {
    this.ants.forEach(colony => {
      colony.forEach(ant => {
        ant.moveRandomly(this.gameSpeed);
      })
    })
  }

  draw() {
    console.log('drawing');

    background(COLORS.BACKGROUND_COLOR);
    noStroke();

    this.homes.forEach((home, index) => {
      fill(this.colonyColors[index]);
      ellipse(home.x, home.y, SIZES.HOME_WIDTH, SIZES.HOME_HEIGHT);
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
        rect(ant.x, ant.y, SIZES.ANT_WIDTH, SIZES.ANT_HEIGHT);
      })
    })
  }
}
