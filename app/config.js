const ANT_SIM_CONFIG = {
  map: {
    drawPheromones: false,
    width: 400,
    height: 400,
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
    antsPerColony: 200,
    sightRange: 5,
    maxHealth: 100
  },
  food: {
    numberOfFoodStacks: 30,
    foodStackSize: 20,
    foodItemValue: 1,
    antHunger: 1,
    lunchInterval: 100,
    birthsThreshold: 400
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
  debug: true,
};
