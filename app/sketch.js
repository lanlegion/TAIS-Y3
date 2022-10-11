let simulation
let isRunning = true
let isDrawing = true

// Switches on and off the simulation
function switchRunning() {
  isRunning = !isRunning
}

// Switches on and off the map rendering and charts live updates
function switchDrawing() {
  isDrawing = !isDrawing
}

function setup() {
  createCanvas(
    ANT_SIM_CONFIG.map.width * ANT_SIM_CONFIG.map.drawScale,
    ANT_SIM_CONFIG.map.height * ANT_SIM_CONFIG.map.drawScale
  )
  frameRate(ANT_SIM_CONFIG.fps)

  const audioContainers = {
    born: document.getElementById('audio_container_born'),
  }

  const uiComponents = new UiComponents(
    select('#stats_div'),
    select('#debug_div'),
    audioContainers
  )

  // Added total food chart
  const totalFoodChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'total_food_chart',
    'Total food',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize
  )

  const foodChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'food_chart',
    'Food',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize
  )

  const healthChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'health_chart',
    'Health',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize
  )

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

  const ageChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'age_chart',
    'Average age',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize
  )

  const charts = {
    totalFoodChart: totalFoodChart,
    foodChart: foodChart,
    healthChart: healthChart,
    populationChart: populationChart,
    deadChart: deadChart,
    ageChart: ageChart,
  }

  simulation = new Simulation(ANT_SIM_CONFIG, uiComponents, charts)
}

function draw() {
  if (isRunning) {
    simulation.run(isDrawing)
    simulation.draw(isDrawing)
  }
}
