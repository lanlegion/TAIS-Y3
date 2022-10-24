let simulation
let uiComponents
let charts
let isRunning = true
let isDrawing = true
let isCharting = true
let parameterName
let parameters
const parameterRanges = {
  'Death diffusion': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], //paramsInRange(0.0, 1.0, 10),
  'Death evaporation': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], //paramsInRange(0.0, 1.0, 10),
  'Death quantity': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], //paramsInRange(0.0, 10.0, 10),
  'Ant lifetime': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], //paramsInRange(0, 1000, 10),
}
let simulationIndex = 0

function paramsInRange(min, max, steps) {
  let arr = []
  for (let i = min; i <= max; i += (max - min) / steps) {
    arr.push(i)
  }
  console.log('generated arguments', arr)
  return arr
}

function useParameters() {
  if (!ANT_SIM_CONFIG.bulk) return
  const paramMenu = document.getElementById('params')
  const name = paramMenu.options[paramMenu.selectedIndex].value
  parameterName = name
  console.log(name)
  parameters = parameterRanges[parameterName]
  console.log('found parameters', parameters, 'for', parameterName)
}

// Switches on and off the simulation
function switchRunning() {
  isRunning = !isRunning
}

// Switches on and off the map rendering and charts live updates
function switchDrawing() {
  isDrawing = !isDrawing
}

function switchVisuals() {
  isCharting = !isCharting
  document.getElementById('charts').hidden = !isCharting
  isDrawing = !isDrawing
}

function setup() {
  let renderer = createCanvas(
    ANT_SIM_CONFIG.map.width * ANT_SIM_CONFIG.map.drawScale,
    ANT_SIM_CONFIG.map.height * ANT_SIM_CONFIG.map.drawScale
  )
  renderer.parent('map')
  frameRate(ANT_SIM_CONFIG.fps)

  const audioContainers = {
    born: document.getElementById('audio_container_born'),
  }

  uiComponents = new UiComponents(
    select('#stats_div'),
    select('#debug_div'),
    audioContainers
  )

  // Added pheromone charts
  const foodPheromoneChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'food_phero_chart',
    'Food pheromone',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize
  )

  const homePheromoneChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'home_phero_chart',
    'Home pheromone',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize
  )

  const dangerPheromoneChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'death_phero_chart',
    'Death pheromone',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize
  )
  // Added total food chart
  /*const totalFoodChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'total_food_chart',
    'Total food',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize
  )*/

  const foodChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'food_chart',
    'Food',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize
  )

  /*const healthChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'health_chart',
    'Health',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize
  )*/

  const populationChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'population_chart',
    'Population',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize
  )

  const deadChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'dead_chart',
    'Dead ants',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize
  )

  /*const ageChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'age_chart',
    'Average age',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize
  )*/

  charts = {
    foodPheromones: foodPheromoneChart,
    homePheromones: homePheromoneChart,
    dangerPheromones: dangerPheromoneChart,
    //totalFoodChart: totalFoodChart,
    foodChart: foodChart,
    //healthChart: healthChart,
    populationChart: populationChart,
    deadChart: deadChart,
    //ageChart: ageChart,
  }

  if (ANT_SIM_CONFIG.bulk) {
    // don't start running and drawing when doing bulk experiments
    isRunning = false
    isDrawing = false
    select('#parameter').html('Simulation not running yet')
  } else {
    document.getElementById('menu').hidden = true
    newSimulation()
  }
}

function startBulk() {
  useParameters()
  newSimulation()
  isRunning = true
}

function newSimulation() {
  if (ANT_SIM_CONFIG.bulk ) {
    const argument = parameters[simulationIndex]
    switch (parameterName) {
      case 'Death diffusion':
        ANT_SIM_CONFIG.pheromones.dangerDiffusion = argument
        break
      case 'Death evaporation':
        ANT_SIM_CONFIG.pheromones.dangerDecay = argument
        break
      case 'Death quantity':
        ANT_SIM_CONFIG.pheromones.deathQuantity = argument
        break
      case 'Ant lifetime':
        ANT_SIM_CONFIG.ants.averageLifeSpan = argument
        break
    }
    simulationIndex++
    select('#parameter').html(
      document.getElementById('parameter').innerHTML + '<br>' + parameterName + ' ' + argument
    )
  }
  simulation = new Simulation(ANT_SIM_CONFIG, uiComponents, charts)
  select('#config').html(ANT_SIM_CONFIG)
}

function draw() {
  if (isRunning) {
    simulation.run(isDrawing)
    simulation.draw(isDrawing)
    if (ANT_SIM_CONFIG.bulk && simulation.done && simulationIndex <= parameters.length) {
      select('#parameter').html(
        document.getElementById('parameter').innerHTML +
          ' food: ' +
          simulation.colonies[0].food.toFixed(2) 
      )
      //console.log(simulationIndex)
      newSimulation()
    }
  }
}
