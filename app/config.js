const ANT_SIM_CONFIG = {
  map: {
    drawPheromones: false,
    width: 100, // In pixels
    height: 100, // In pixels
    colors: {
      colony: [
        '#f0f64d',
        '#ffae52',
        '#c2f3e7',
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
  fps: 60, // Pretty irrelevant
  gameSpeed: 1,
  ants: {
    numberOfColonies: 6,
    antsPerColony: 350,
    sightRange: 5,
    maxHealth: 100,
    bornInterval: 10, // Measured in ticks
    bornPopulationPercent: 0.02,
    bornDeviation: 2,
    averageLifeSpan: 2000, // Measured in ticks
    lifeSpanDeviation: 400, // Measured in ticks
    hitDamage: 20,
    hitDeviation: 5,
    extraHitPowerFromFood: 0.005,
    minimumAntsForCreation: 10
  },
  food: {
    numberOfFoodStacks: 10,
    foodStackSize: 20,
    foodItemValue: 1,
    antHunger: 0.0007,
    lunchInterval: 10,
    birthsThreshold: 0, // Minimum amount of food that a colony must have to multiply
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
  playSounds: false,
  cleanupInterval: 100
};
