const ANT_SIM_CONFIG = {
  map: {
    drawPheromones: true,
    drawScale: 5, // scale drawing
    width: 300, // In pixels
    height: 300, // In pixels
    colors: {
      colony: [
        '#f0f64d',
        '#ffae52',
        '#c2f3e7',
        '#ff2020',
        '#c2367e',
        '#9933d4',
        '#000000',
      ],
      foodColor: '#75b8c8',
      backgroundColor: '#e6f5f2',
      deadAntColor: '#707070',
      antWithFood: '#14f43c',
    },
    sizes: {
      home: {
        x: 15,
        y: 15,
      },
    },
  },
  fps: 60, // Pretty irrelevant
  gameSpeed: 1,
  ants: {
    numberOfColonies: 1,
    antsPerColony: 150,
    sightRange: 5,
    maxHealth: 100,
    bornInterval: 10, // Measured in ticks
    bornPopulationPercent: 0.02,
    bornDeviation: 2,
    averageLifeSpan: 500, // Measured in ticks, old: 2000, new: 500
    lifeSpanDeviation: 400, // Measured in ticks
    hitDamage: 20,
    hitDeviation: 5,
    extraHitPowerFromFood: 0.005,
    minimumAntsForCreation: 10,
  },
  food: {
    numberOfFoodStacks: 30,
    foodStackSize: 20,
    foodItemValue: 1,
    antHunger: 0.01, // How much food an ant will eat at each tick
    birthsThreshold: 0, // Minimum amount of food that a colony must have to multiply
    starveSpeed: 0.033,
    healingSpeed: 0.2,
  },
  pheromones: {
    foodDecay: 0.94,
    homeDecay: 0.94,
    dangerDecay: 0.94, // added danger decay
    existingLimit: 0.06,
    useDanger: true, // added danger switch
  },
  probabilities: {
    maintainDirectionOnRandom: 0.75,
    moveRandomWhileSeeking: 0.2,
    minScoreLimit: 0.01,
    turnLeftOnRandom: 0.875,
  },
  charts: {
    lengthThreshold: 100,
    aggregationSize: 10,
    intervalPush: 10,
  },
  debug: true,
  drawingTicks: 10,
  playSounds: false,
  cleanupInterval: 100,
}
