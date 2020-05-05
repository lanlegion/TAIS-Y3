let simulation;
let isRunning = true;

// Switches on and off the simulation
function switchRunning() {
  isRunning = !isRunning;
}

function setup() {
  createCanvas(ANT_SIM_CONFIG.map.width, ANT_SIM_CONFIG.map.height);
  frameRate(ANT_SIM_CONFIG.fps);

  const audioContainers = {
    born: document.getElementById('audio_container_born')
  };

  const uiComponents = new UiComponents(select('#stats_div'), select('#debug_div'), audioContainers);

  const foodChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'food_chart',
    'Food',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize);

  const healthChart = new AntsChart(
    ANT_SIM_CONFIG.ants.numberOfColonies,
    ANT_SIM_CONFIG.map.colors.colony,
    'health_chart',
    'Health',
    ANT_SIM_CONFIG.charts.lengthThreshold,
    ANT_SIM_CONFIG.charts.aggregationSize);

  const charts = {
    foodChart: foodChart,
    healthChart: healthChart
  }

  simulation = new Simulation(ANT_SIM_CONFIG, uiComponents, charts);
}

function draw() {
  if (isRunning) {
    simulation.run();
    simulation.draw();
  }
}
