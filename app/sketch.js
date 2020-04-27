const WIDTH = 500;
const HEIGHT = 500;
const FPS = 60;
const NUMBER_OF_COLONIES = 1;
const ANTS_PER_COLONY = 100;
const FOOD_STACKS = 30;
const FOOD_STACK_SIZE = 10;
const GAME_SPEED = 1;
const FOOD_PHEROMONE_DECAY = 0.99;
const HOME_PHEROMONE_DECAY = 0.99;
const ANT_RANGE = 4;

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
    X: 20,
    Y: 20,
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

let simulation;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  frameRate(FPS);

  const simulationConfig = new SimulationConfig(
    WIDTH,
    HEIGHT,
    FPS,
    NUMBER_OF_COLONIES,
    ANTS_PER_COLONY,
    FOOD_STACKS,
    FOOD_STACK_SIZE,
    GAME_SPEED,
    FOOD_PHEROMONE_DECAY,
    HOME_PHEROMONE_DECAY,
    ANT_RANGE
  );

  const drawingConfig = new DrawingConfig(
    COLORS.HOME_COLOR,
    COLORS.FOOD_COLOR,
    COLORS.BACKGROUND_COLOR,
    COLORS.ANT_COLOR,
    COLORS.DEAD_ANT_COLOR,
    COLORS.ANT_WITH_FOOD,
    SIZES.HOME,
    SIZES.ANT,
    SIZES.FOOD
  );

  simulation = new Simulation(simulationConfig, drawingConfig);
}

function draw() {
  simulation.run();
  simulation.draw();
}
