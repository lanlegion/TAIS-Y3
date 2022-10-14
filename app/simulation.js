class Simulation {
  constructor(config, uiComponents, charts) {
    console.log(`Simulation config: ${JSON.stringify(config, undefined, 2)}`)

    this.config = config
    this.uiComponents = uiComponents
    this.charts = charts
    this.chartsCache = {
      food: [],
      health: [],
    }
    this.antsOnMap = {}

    this.tick = 0

    let occupiedCells = new Set()
    this._initCells()
    this._initWalls(occupiedCells) // added obstacles
    this._initHomes(occupiedCells)
    this._initAnts()
    this._initColoniesColors()
    this._initFoodStacks(occupiedCells)

    console.log('Simulation initialization complete!')
  }

  _initCells() {
    console.log('Initializing cells')
    this.cells = []
    this.pheromoneCells = new Set()
    this.pheroFoodCells = new Set()
    this.pheroHomeCells = new Set()
    this.pheroDangerCells = new Set() // TODO refactor
    for (let x = 0; x < this.config.map.width; x++) {
      let row = []
      for (let y = 0; y < this.config.map.height; y++) {
        row.push(new Cell(x, y))
      }
      this.cells.push(row)
    }
  }

  _initHomes(occupiedCells) {
    console.log('Initializing homes')
    this.homes = []
    for (let colony = 0; colony < this.config.ants.numberOfColonies; colony++) {
      let colonyHomes = []
      this._gatRandomSquareLocations().forEach((cell) => {
        if (!occupiedCells.has(`${cell.x}-${cell.y}`)) {
          occupiedCells.add(`${cell.x}-${cell.y}`)
          cell.type = CellType.HOME
          colonyHomes.push(cell)
        }
      })
      this.homes.push(colonyHomes)
    }
  }

  randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  _randomAntExpectancy() {
    return this.randomIntFromInterval(
      this.config.ants.averageLifeSpan - this.config.ants.lifeSpanDeviation,
      this.config.ants.averageLifeSpan + this.config.ants.lifeSpanDeviation
    )
  }

  _randomHitDamage() {
    return this.randomIntFromInterval(
      this.config.ants.hitDamage - this.config.ants.hitDeviation,
      this.config.ants.hitDamage + this.config.ants.hitDeviation
    )
  }

  _initAnts() {
    console.log('Initializing ants')
    this.ants = []
    this.colonies = []
    for (let colony = 0; colony < this.config.ants.numberOfColonies; colony++) {
      const colonyStats = new ColonyStats(
        colony,
        this.config.ants.antsPerColony
      )
      this.colonies.push(colonyStats)
      this.ants.push([])
      for (let ant = 0; ant < this.config.ants.antsPerColony; ant++) {
        const initialPosition = this._getInitialPositionForAnt(colony)
        this.ants[colony].push(
          new Ant(
            initialPosition.x,
            initialPosition.y,
            colony,
            this,
            colonyStats,
            this.config.ants.maxHealth,
            this.config.food.antHunger,
            this.config.food.starveSpeed,
            this.config.food.healingSpeed,
            this._randomAntExpectancy(),
            this._randomHitDamage()
          )
        )
      }
    }
  }

  _initColoniesColors() {
    console.log('Initializing colonies colors')
    this.colonyColors = []
    for (let colony = 0; colony < this.config.ants.numberOfColonies; colony++) {
      this.colonyColors.push(this.config.map.colors.colony[colony])
    }
  }

  _initFoodStacks(occupiedCells) {
    console.log('Initializing food stacks')
    this.foods = []
    for (let food = 0; food < this.config.food.numberOfFoodStacks; food++) {
      const randomLocation = this._getRandomLocationOnMap()
      for (
        let x = randomLocation.x;
        x < randomLocation.x + this.config.food.foodStackSize &&
        x < this.config.map.width;
        x++
      ) {
        for (
          let y = randomLocation.y;
          y < randomLocation.y + this.config.food.foodStackSize &&
          y < this.config.map.height;
          y++
        ) {
          if (occupiedCells.has(`${x}-${y}`)) {
            continue
          }
          occupiedCells.add(`${x}-${y}`)
          const currentCell = this.cells[x][y]
          currentCell.type = CellType.FOOD
          this.foods.push(currentCell)
        }
      }
    }
  }

  // Added obstacles
  _initWalls(occupiedCells) {
    console.log('Initializing walls/obstacles')
    console.log(this.config.map.width/2)
    this.walls = []
    for (let x = 0; x < this.config.map.width/2; x++)
      for (let y = 0; y < 10; y++)
      {
        const posX = this.config.map.width/4 + x
        const posY = this.config.map.height/2 + y
        if (occupiedCells.has(`${posX}-${posY}`)) { // TODO NOTE: doesn't this cause a lack of food stacks?
          continue
        }
        occupiedCells.add(`${posX}-${posY}`)
        const currentCell = this.cells[posX][posY]
        currentCell.type = CellType.WALL
        this.walls.push(currentCell) // TODO refactor
      }
    console.log('walls', this.walls)
  }

  /**
   * Retrieves a random Cell from the map.
   * @return {Cell} the random cell.
   * @private
   */
  _getRandomCell() {
    const randomLocation = this._getRandomLocationOnMap()
    return this.getCell(randomLocation.x, randomLocation.y)
  }

  /**
   * Retrieves a random position on the map.
   * @return {{x: number, y: number}} the random position.
   * @private
   */
  _getRandomLocationOnMap() {
    return {
      x: 1 + int(Math.random() * this.config.map.width),
      y: 1 + int(Math.random() * this.config.map.height),
    }
  }

  /**
   * Retrieves a random square (multiple adjacent cells) from the map.
   * @param sizes {{x: number, y: number}} the dimensions of the square.
   * @return [Cell] the list of random Cells
   * @private
   */
  _gatRandomSquareLocations(sizes = { x: 10, y: 10 }) {
    let randomCells = []
    const randomLocation = this._getRandomLocationOnMap()
    for (let x = randomLocation.x; x < randomLocation.x + sizes.x; x++) {
      for (let y = randomLocation.y; y < randomLocation.y + sizes.y; y++) {
        const newCell = this.getCell(x, y)
        if (newCell !== null) {
          randomCells.push(newCell)
        }
      }
    }
    return randomCells
  }

  /**
   * Generates a random color string.
   * @return {string} the color string.
   * @private
   */
  _getRandomColorString() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16)
  }

  /**
   * Generates a pseudo-random initial position for an ant. It will be on one of the
   * colony home cells.
   * @param colony {number} the index of the colony of the ant.
   * @return {{x: number, y: number}} the initial position for the ant.
   * @private
   */
  _getInitialPositionForAnt(colony) {
    const randomHomeCell =
      this.homes[colony][Math.floor(Math.random() * this.homes[colony].length)]
    return {
      x: randomHomeCell.x,
      y: randomHomeCell.y,
    }
  }

  /**
   * Retrieves the cell at a given position.
   * @param x {number}
   * @param y {number}
   * @return {Cell|null} if the x y coordinates are invalid null, the Cell otherwise.
   */
  getCell(x, y) {
    if (x < 0 || x >= this.config.map.width) {
      return null
    }
    if (y < 0 || y >= this.config.map.height) {
      return null
    }
    return this.cells[x][y]
  }

  /**
   * Removes the food from a cell (it converts it from a FOOD cell to an EMPTY cell).
   * @param cell {Cell} from where the food should be removed
   */
  clearFood(cell) {
    cell.type = CellType.EMPTY
    let index = this.foods.indexOf(cell)
    if (index !== -1) {
      this.foods.splice(index, 1)
    }
  }

  /**
   * Stores the food for the colony.
   * @param colony
   * @param quantity
   */
  storeFood(colony, quantity = 1) {
    this.colonies[colony].storeFood(quantity)
  }

  /**
   * Executes one tick of the simulation.
   */
  run(isDrawing) {
    let newAntsOnMap = {}
    this.tick++
    this.ants.forEach((colony, index) => {
      let totalColonyHealth = 0
      let totalColonyAge = 0
      let numberOfAliveAnts = 0
      colony.forEach((ant) => {
        if (!ant.isDead) {
          numberOfAliveAnts += 1
          if (newAntsOnMap[ant.x] === undefined) {
            newAntsOnMap[ant.x] = {}
          }
          if (newAntsOnMap[ant.x][ant.y] === undefined) {
            newAntsOnMap[ant.x][ant.y] = []
          }
          newAntsOnMap[ant.x][ant.y].push(ant)
          totalColonyHealth += ant.health
          totalColonyAge += ant.age
          ant.move()
          ant.eatFood()
          ant.aging()
          this._antLeavesPheromone(ant, this.getCell(ant.x, ant.y))
        }
      })
      this.colonies[index].averageHealth = totalColonyHealth / numberOfAliveAnts
      this.colonies[index].averageAge = totalColonyAge / numberOfAliveAnts
    })
    this.antsOnMap = newAntsOnMap
    if (this.config.pheromones.useDiffusion) {
      this._diffusePheromones(this.ants[0]) // refactor
    }
    this._decayPheromone()
    this._consumeFood()
    this._bornAnts()
    this._updateCharts(isDrawing)
    if (this.tick % this.config.cleanupInterval === 0) {
      this._cleanup()
    }
  }

  /**
   * Adds the data from this tick of the simulation to the charts.
   * @private
   */
  _updateCharts(isDrawing) {
    if (this.tick % this.config.charts.intervalPush !== 0) {
      return
    }

    let totalFoodCurrentStats = []
    let foodCurrentStats = []
    let healthCurrentStats = []
    let populationCurrentStats = []
    let deadCurrentStats = []
    let averageAge = []

    for (let colony = 0; colony < this.colonies.length; colony++) {
      if (this.colonies[colony].numberOfAnts === 0) {
        totalFoodCurrentStats.push(null)
        foodCurrentStats.push(null)
        healthCurrentStats.push(null)
        populationCurrentStats.push(null)
        deadCurrentStats.push(null)
        averageAge.push(null)
      } else {
        totalFoodCurrentStats.push(this.colonies[colony].totalFood)
        foodCurrentStats.push(this.colonies[colony].food)
        healthCurrentStats.push(this.colonies[colony].averageHealth)
        populationCurrentStats.push(this.colonies[colony].numberOfAnts)
        deadCurrentStats.push(this.colonies[colony].numberOfDeadAnts)
        averageAge.push(this.colonies[colony].averageAge)
      }
    }

    this.charts.totalFoodChart.pushData(
      totalFoodCurrentStats,
      this.tick,
      isDrawing
    )
    this.charts.foodChart.pushData(foodCurrentStats, this.tick, isDrawing)
    this.charts.healthChart.pushData(healthCurrentStats, this.tick, isDrawing)
    this.charts.populationChart.pushData(
      populationCurrentStats,
      this.tick,
      isDrawing
    )
    this.charts.deadChart.pushData(deadCurrentStats, this.tick, isDrawing)
    this.charts.ageChart.pushData(averageAge, this.tick, isDrawing)
  }

  /**
   * Leaving pheromone from ants based on its activity.
   * @param ant {Ant} the ant which leaves pheromone.
   * @param currentCell {Cell} the cell on which the ant is.
   * @param quantity {number} the quantity of pheromone which is left by the ant.
   */
  _antLeavesPheromone(ant, currentCell, quantity = 1) {
    if (currentCell !== null && !ant.isDead) {
      if (ant.carryingFood) {
        currentCell.addFoodPheromone(quantity, ant.colony)
        this.pheroFoodCells.add(currentCell)
      } else {
        currentCell.addHomePheromone(quantity, ant.colony)
        this.pheroHomeCells.add(currentCell)
      }
      this.pheromoneCells.add(currentCell)
    }
    // danger pheromone, left in the cell when the ant dies
    // and isn't holding food
    // TODO: hasn't picked up food during its lifetime?
    if (
      this.config.pheromones.useDanger &&
      currentCell !== null &&
      ant.isDead &&
      !ant.carryingFood
    ) {
      currentCell.addDangerPheromone(quantity, ant.colony)
      this.pheromoneCells.add(currentCell) // TODO refactor?
      this.pheroDangerCells.add(currentCell)
    }
  }

  // Added pheromone diffusion
  _diffusePheromones(directions) {
    console.log('test')
    for (let cell in this.pheromoneCells) {
      for (let direction in directions) {
        const currentCell = this.getCell(
          cell.x + direction.x,
          cell.y + direction.y
        )
        currentCell.pheromones = cell.pheromones
        console.log('diffusion', currentCell.pheromones)
      }
    }
  }

  /**
   * Decay the pheromones over time.
   */
  _decayPheromone() {
    let cellsToDelete = []
    for (let cell in this.pheromoneCells) {
      cell.decayPheromones(
        this.config.pheromones.foodDecay,
        this.config.pheromones.homeDecay,
        this.config.pheromones.dangerDecay
      )
      if (!cell.hasAnyPheromones()) {
        cellsToDelete.push(cell)
      }
    }
    cellsToDelete.forEach((cell) => {
      this.pheromoneCells.delete(cell)
      // TODO refactor
      this.pheroFoodCells.delete(cell)
      this.pheroHomeCells.delete(cell)
      this.pheroDangerCells.delete(cell)
      console.log('deleted cell!')
    })
  }

  /**
   * Consume food over time.
   */
  _consumeFood() {
    this.colonies.forEach((colony) => {
      colony.eatFood()
    })
  }

  /**
   * Creates new ants for each colony based on its stats.
   * @private
   */
  _bornAnts() {
    let anyAntsBorn = false
    this.colonies.forEach((colony, index) => {
      if (
        colony.food > this.config.food.birthsThreshold &&
        colony.numberOfAnts > this.config.ants.minimumAntsForCreation &&
        this.tick % this.config.ants.bornInterval === 0
      ) {
        this._bornAntsInColony(index, colony)
        anyAntsBorn = true
      }
    })
    if (this.config.playSounds && anyAntsBorn) {
      this.uiComponents.audioContainers.born.play().catch((reason) => {
        console.error(reason)
      })
    }
  }

  /**
   * Creates new ants for a given colony.
   * @param colonyId {number} the index of th ecolony
   * @param colony {ColonyStats}
   * @private
   */
  _bornAntsInColony(colonyId, colony) {
    const fixedBirthValue = int(
      this.config.ants.bornPopulationPercent * colony.numberOfAnts
    )
    const numOfNewAnts = this.randomIntFromInterval(
      fixedBirthValue / this.config.ants.bornDeviation,
      fixedBirthValue * this.config.ants.bornDeviation
    )

    for (let ant = 0; ant < numOfNewAnts; ant++) {
      const initialPosition = this._getInitialPositionForAnt(colonyId)
      const newborn = new Ant(
        initialPosition.x,
        initialPosition.y,
        colonyId,
        this,
        colony,
        this.config.ants.maxHealth,
        this.config.food.antHunger,
        this.config.food.starveSpeed,
        this.config.food.healingSpeed,
        this._randomAntExpectancy(),
        this.config.ants.hitDamage
      )
      this.ants[colonyId].push(newborn)
      colony.antBorn()
    }
  }

  draw(isDrawing) {
    if (this.tick % this.config.drawingTicks !== 0) {
      return
    }

    this.uiComponents.statsDiv.html(this.statsHtmlString())
    if (this.config.debug) {
      this.uiComponents.debugDiv.html(this.debugHtmlString())
    }

    if (!isDrawing) {
      return
    }

    background(this.config.map.colors.backgroundColor)
    noStroke()

    // TODO refactor
    if (this.config.map.drawPheromones) {
      fill('rgba(50,255,255,0.5)') // cyan = food phero
      this.pheroFoodCells.forEach((cell) => {
        // TODO alpha based on pheromone concentration?
        // TODO NOTE: only works for one colony
        //const alpha = cell.pheromones.food[0]
        //fill('rgba(50,255,50,' + alpha + ')') // green = food phero
        console.log(cell.pheromones.food)
        drawCell(cell, this.config.map.drawScale)
      })
      fill('rgba(255,70,220,0.5)') // magenta = home phero
      this.pheroHomeCells.forEach((cell) => {
        drawCell(cell, this.config.map.drawScale)
      })
      fill('rgba(255,50,50,0.5)') // red = danger phero
      this.pheroDangerCells.forEach((cell) => {
        drawCell(cell, this.config.map.drawScale)
      })
    }

    function drawCell(cell, drawScale) {
      rect(cell.x * drawScale, cell.y * drawScale, 1 * drawScale, 1 * drawScale)
    }

    this.homes.forEach((cells, index) => {
      fill(this.colonyColors[index])
      cells.forEach((cell) => {
        drawCell(cell, this.config.map.drawScale)
      })
    })

    this.walls.forEach((cell) => {
      fill('rgba(50,50,50,0.9)')
        drawCell(cell, this.config.map.drawScale)
    })

    this.ants.forEach((colony, index) => {
      colony.forEach((ant) => {
        let antColor = this.colonyColors[index]
        if (ant.isDead) {
          antColor = this.config.map.colors.deadAntColor
        } else if (ant.carryingFood) {
          antColor = this.config.map.colors.antWithFood
        }
        fill(antColor)
        drawCell(ant, this.config.map.drawScale)
      })
    })

    fill(this.config.map.colors.foodColor)
    this.foods.forEach((foodCell) => {
      drawCell(foodCell, this.config.map.drawScale)
    })
  }

  statsHtmlString() {
    let prettyString = ''
    this.colonies.forEach((colonyStats, index) => {
      let tempString =
        `<span style="color:${this.colonyColors[index]}">Colony id: ${colonyStats.index}  ` +
        `Food: ${colonyStats.food.toFixed(2)}  ` +
        `Alive ants: ${colonyStats.numberOfAnts}  ` +
        `Dead ants: ${colonyStats.numberOfDeadAnts}  ` +
        `Avg health:  ${colonyStats.averageHealth.toFixed(2)}  ` +
        `<br></span>`

      if (colonyStats.numberOfAnts === 0) {
        tempString = '<strike>' + tempString + '</strike>'
      }
      prettyString += tempString
    })
    return prettyString
  }

  debugHtmlString() {
    let prettyString = `Tick: ${this.tick}<br>Cells with pheromone in set: ${this.pheromoneCells.size}`
    return prettyString
  }

  /**
   * Garbage collects no more useful ants (dead) and almost gone pheromones.
   * @private
   */
  _cleanup() {
    let newColonies = []
    let cleanedAnts = 0
    for (let colony = 0; colony < this.config.ants.numberOfColonies; colony++) {
      let oneNewColony = []
      this.ants[colony].forEach((ant) => {
        if (!ant.isDead) {
          oneNewColony.push(ant)
        } else {
          cleanedAnts++
        }
      })
      newColonies.push(oneNewColony)
    }
    this.ants = newColonies
    console.log(`Cleaned ${cleanedAnts} dead ants`)

    let cleanedPheromoneColonyCells = {
      home: 0,
      food: 0,
    }
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        const cleanResult = cell.cleanPheromones()
        cleanedPheromoneColonyCells.food += cleanResult.food
        cleanedPheromoneColonyCells.home += cleanResult.home
      })
    })
    console.log(
      `Cleaned pheromones: food - ${cleanedPheromoneColonyCells.food}   home - ${cleanedPheromoneColonyCells.home}`
    )
  }
}
