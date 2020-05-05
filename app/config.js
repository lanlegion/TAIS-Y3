const ANT_SIM_CONFIG = {
  map: {
    drawPheromones: false,
    width: 600,
    height: 600,
    colors: {
      colony: [
        '#f0f64d',
        '#6ae36a',
        '#37f5c9',
        '#ff2020',
        '#c2367e',
        '#9933d4',
        '#000000'
      ],
      foodColor: '#75b8c8',
      backgroundColor: '#e6f5f2',
      deadAntColor: '#707070',
      antWithFood: '#14f43c'
    },
    sizes: {
      home: {
        x: 15,
        y: 15
      }
    }
  },
  fps: 60,
  gameSpeed: 1,
  ants: {
    numberOfColonies: 5,
    antsPerColony: 150,
    sightRange: 5,
    maxHealth: 100,
    bornInterval: 10
  },
  food: {
    numberOfFoodStacks: 20,
    foodStackSize: 100,
    foodItemValue: 1,
    antHunger: 0.007,
    lunchInterval: 100,
    birthsThreshold: 100,
    starveSpeed: 0.033,
    healingSpeed: 0.2
  },
  pheromones: {
    foodDecay: 0.99,
    homeDecay: 0.99
  },
  probabilities: {
    maintainDirectionOnRandom: 0.75,
    moveRandomWhileSeeking: 0.2,
    minScoreLimit: 0.01,
    turnLeftOnRandom: 0.875
  },
  charts: {
    lengthThreshold: 100,
    aggregationSize: 10,
    intervalPush: 10,
  },
  debug: true,
  drawingTicks: 10,
  playSounds: false
};
