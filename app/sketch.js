const WIDTH = 1000;
const HEIGHT = 600;
const FPS = 60;
const NUMBER_OF_COLONIES = 1; // Max 5
const ANTS_PER_COLONY = 100;
const FOOD_STACKS = 30;
const FOOD_STACK_SIZE = 10;
const GAME_SPEED = 1;

let simulation;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  frameRate(FPS);

  simulation = new Simulation(WIDTH, HEIGHT, NUMBER_OF_COLONIES, ANTS_PER_COLONY, GAME_SPEED, FOOD_STACKS, FOOD_STACK_SIZE);
}

function draw() {
  simulation.run();
  simulation.draw();
}
