const WIDTH = 1000;
const HEIGHT = 600;
const FPS = 30;
const NUMBER_OF_COLONIES = 3; // Max 5
const ANTS_PER_COLONY = 50;
const GAME_SPEED = 0.3;

let simulation;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  // frameRate(FPS);

  simulation = new Simulation(WIDTH, HEIGHT, NUMBER_OF_COLONIES, ANTS_PER_COLONY, GAME_SPEED);
}

function draw() {
  simulation.run();
  simulation.draw();
}
