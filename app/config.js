const ANT_SIM_CONFIG = {
  bulk: true,
  simTime: 5000, //5000, // In ticks
  map: {
    randomLocations: false,
    obstacles: false,
    drawPheromones: true,
    drawScale: 5, // scale drawing
    width: 100, //300, // In pixels
    height: 100, //300, // In pixels
    colors: {
      colony: [
        '#153b5b',
        '#ffae52',
        '#c2f3e7',
        '#ff2020',
        '#c2367e',
        '#9933d4',
        '#000000',
      ],
      foodColor: '#1b992c',
      backgroundColor: '#969E9E', //'#e6f5f2',
      deadAntColor: '#707070',
      antWithFood: '#14f43c',
    },
    nestPosition: { x: 20, y: 20 },
    foodPosition: { x: 70, y: 70 },
    sizes: {
      home: {
        x: 10,
        y: 10,
      },
    },
  },
  fps: 60, // Pretty irrelevant
  gameSpeed: 1,
  ants: {
    maxPopulation: 1000,
    maxAtLocation: 10,
    numberOfColonies: 1,
    antsPerColony: 2,//2, //150,
    sightRange: 2,//5,
    maxHealth: 100,
    bornInterval: 1, // Measured in ticks
    bornPopulationPercent: 1, //0.02, //TODO: absolute 2 per timestep??
    bornPopulationAbsolute: 2,
    bornDeviation: 0, //2,
    averageLifeSpan: 500, // Measured in ticks, old: 2000, paper: 500
    lifeSpanDeviation: 0, //400, // Measured in ticks
    hitDamage: 20,
    hitDeviation: 5,
    extraHitPowerFromFood: 0.005,
    minimumAntsForCreation: 0, //10,
  },
  food: {
    numberOfFoodStacks: 3, //30,
    foodStackSize: 10, //20,
    foodItemValue: 1,
    antHunger: 0, // How much food an ant will eat at each tick
    birthsThreshold: 0, // Minimum amount of food that a colony must have to multiply
    starveSpeed: 0,
    healingSpeed: 0.2,
  },
  pheromones: {
    maxPheromone: 1,
    useTopOff: true,
    useMax: true, // NOTE: should be used with top off | drop maximal neighbouring pheromone
    dropScale: 1, //0.2, // portion of quantity left by an ant at once
    diffusionScale: 0.01, //1, //0.5, // quantity scale during diffusion
    useDiffusion: true,
    foodDiffusion: 0.01,
    homeDiffusion: 0.01,
    dangerDiffusion: 0.5,
    foodDecay: 0.94,
    homeDecay: 0.94,
    dangerDecay: 0.94, // added danger decay
    existingLimit: 0, //0.0001, //0.06
    useDanger: true, // added danger switch
    deathQuantity: 3,
  },
  probabilities: {
    maintainDirectionOnRandom: 0.33,
    moveRandomWhileSeeking: 0.5,
    minScoreLimit: 0, //0.01,
    turnLeftOnRandom: 0.5,
  },
  charts: {
    lengthThreshold: 100,
    aggregationSize: 10,
    intervalPush: 10,
  },
  debug: true,
  drawingTicks: 1,
  playSounds: false,
  cleanupInterval: 100,
}
