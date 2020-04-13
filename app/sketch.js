const WIDTH = 1000;
const HEIGHT = 600;
const FPS = 60;
const NUMBER_OF_COLONIES = 5; // Max 5
const ANTS_PER_COLONY = 200;
const FOOD_STACKS = 20;
const FOOD_STACK_SIZE = 10;
const GAME_SPEED = 0.4;

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
