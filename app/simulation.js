class Simulation {
  constructor(config, uiComponents, charts) {
    console.log(`Simulation config: ${JSON.stringify(config, undefined, 2)}`)

    // TODO is copy paste from ant directions
    this.directions = [
      { x: 0, y: -1 },
      { x: 1, y: -1 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: -1, y: 1 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
    ]
    //[{x:1, y:1}]

    this.maxPheromone = 0
    this.diffuseAmount = 0

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
    if (this.config.map.obstacles) this._initWalls(occupiedCells) // added obstacles
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
    for (let x = 0; x < this.config.map.width; x++) {
      let row = []
      for (let y = 0; y < this.config.map.height; y++) {
        row.push(new Cell(x, y, this.config.pheromones.maxPheromone,
           this.config.pheromones.useTopOff))
      }
      this.cells.push(row)
    }
  }

  _initHomes(occupiedCells) {
    console.log('Initializing homes')
    this.homes = []
    for (let colony = 0; colony < this.config.ants.numberOfColonies; colony++) {
      let colonyHomes = []
      this._gatRandomSquareLocations(CellType.HOME,this.config.map.sizes.home).forEach((cell) => {
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
    //if (this.config.map.randomLocations) {
    for (let food = 0; food < this.config.food.numberOfFoodStacks; food++) {
      let randomLocation = this.config.map.foodPosition
      if (this.config.map.randomLocations) {
        randomLocation = this._getRandomLocationOnMap()
      }
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
    /*} else {
      for (let food = 0; food < this.config.food.numberOfFoodStacks; food++) {
        this._gatRandomSquareLocations(CellType.FOOD, {
          x: this.config.food.foodStackSize,
          y: this.config.food.foodStackSize,
        }).forEach((cell) => {
          occupiedCells.add(`${cell.x}-${cell.y}`)
          cell.type = CellType.FOOD
          this.foods.push(cell)
        })
      }
    }*/
  }

  // Added obstacles
  _initWalls(occupiedCells) {
    console.log('Initializing walls/obstacles')
    console.log(this.config.map.width / 2)
    this.walls = []
    for (let x = 0; x < this.config.map.width / 2; x++)
      for (let y = 0; y < 10; y++) {
        const posX = this.config.map.width / 4 + x
        const posY = this.config.map.height / 2 + y
        if (occupiedCells.has(`${posX}-${posY}`)) {
          // TODO NOTE: doesn't this cause a lack of food stacks?
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
  _gatRandomSquareLocations(cellType, sizes = { x: 5, y: 5 }) {
    let randomCells = []
    let randomLocation = {}

    if (this.config.map.randomLocations) {
      randomLocation = this._getRandomLocationOnMap()
    } else {
      switch (cellType) {
        case CellType.FOOD:
          randomLocation = this.config.map.foodPosition
          break
        case CellType.HOME:
          randomLocation = this.config.map.nestPosition
          console.log(this.config)
          break
      }
    }
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
    if (this.tick >= this.config.simTime) return // stop if sim time is over
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
      //this._diffusePheromones(this.ants[0][0].directions) // refactor
      this._diffusePheromones(this.directions)
    }
    this._decayPheromone()
    this._consumeFood()
    this._bornAnts()
    if (isCharting) this._updateCharts(isDrawing)
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

    // TODO refactor
    let foodPheromoneStats = []
    let homePheromoneStats = []
    let dangerPheromoneStats = []
    //let totalFoodCurrentStats = []
    let foodCurrentStats = []
    //let healthCurrentStats = []
    let populationCurrentStats = []
    let deadCurrentStats = []
    let averageAge = []

    for (let colony = 0; colony < this.colonies.length; colony++) {
      if (this.colonies[colony].numberOfAnts === 0) {
        // TODO refactor
        //totalFoodCurrentStats.push(null)
        foodCurrentStats.push(null)
        //healthCurrentStats.push(null)
        populationCurrentStats.push(null)
        deadCurrentStats.push(null)
        averageAge.push(null)
      } else {
        //console.log('total food',this.colonies[colony].totalFood)
        //totalFoodCurrentStats.push(this.colonies[colony].totalFood)
        foodCurrentStats.push(this.colonies[colony].food)
        //healthCurrentStats.push(this.colonies[colony].averageHealth)
        populationCurrentStats.push(this.colonies[colony].numberOfAnts)
        deadCurrentStats.push(this.colonies[colony].numberOfDeadAnts)
        averageAge.push(this.colonies[colony].averageAge)
      }
    }
    // Update pheromone charts data
    // NOTE only works for one colony

    function sumPheromones(cells, key) {
      // TODO refactor: iterate over cells instead?
      /*return Object.entries(cells).reduce((a,b)=>{
      a.pheromones[key][0] + b.pheromones[key][0]},0)*/
      let sum = 0
      for (const cell of cells) {
        //if (cell.pheromones)
        const pheroAmount = cell.pheromones[key][0]
        if (!pheroAmount) {
          sum += 0
          //console.log('YOOO', cell.pheromones)  // TODO this is odd? should this be null?
        } else {
          sum += pheroAmount
        }
      }
      return sum
    }
    //console.log('phero food cells', this.pheroFoodCells)
    //const foodPheromones = sumPheromones(this.pheroFoodCells, 'food')
    this.foodPheroAmount = sumPheromones(this.pheromoneCells, 'food')
    //console.log('foodpheros',foodPheromones)
    foodPheromoneStats.push(this.foodPheroAmount)
    //const homePheromones = sumPheromones(this.pheroHomeCells, 'home')
    this.homePheroAmount = sumPheromones(this.pheromoneCells, 'home')
    //console.log('homepheros',homePheromones)
    homePheromoneStats.push(this.homePheroAmount)

    this.dangerPheroAmount = sumPheromones(this.pheromoneCells, 'danger')
    dangerPheromoneStats.push(this.dangerPheroAmount)

    // Push to charts
    this.charts.foodPheromones.pushData(
      foodPheromoneStats,
      this.tick,
      isDrawing
    )
    this.charts.homePheromones.pushData(
      homePheromoneStats,
      this.tick,
      isDrawing
    )
    this.charts.dangerPheromones.pushData(
      dangerPheromoneStats,
      this.tick,
      isDrawing
    )
    this.charts.foodChart.pushData(foodCurrentStats, this.tick, isDrawing)
    //this.charts.healthChart.pushData(healthCurrentStats, this.tick, isDrawing)
    this.charts.populationChart.pushData(
      populationCurrentStats,
      this.tick,
      isDrawing
    )
    this.charts.deadChart.pushData(deadCurrentStats, this.tick, isDrawing)
    this.charts.ageChart.pushData(averageAge, this.tick, isDrawing)
  }

  _neighbouringCells(cell) {
    let neighbours = []
    for (const direction of this.directions) {
      const currentCell = this.getCell(
        cell.x + direction.x,
        cell.y + direction.y
      )
      if (currentCell) neighbours.push(currentCell)
    }
    return neighbours
  }

  /**
   * Leaving pheromone from ants based on its activity.
   * @param ant {Ant} the ant which leaves pheromone.
   * @param currentCell {Cell} the cell on which the ant is.
   * @param quantity {number} the quantity of pheromone which is left by the ant.
   */
  _antLeavesPheromone(
    ant,
    currentCell,
    quantity = this.config.pheromones.maxPheromone
  ) {
    function getMaxPheromone(sim, key, type) {
      if (currentCell.type == type) {
        //console.log('FOUND', key)
        return quantity
      }
      let max = 0
      for (const neighbourCell of sim._neighbouringCells(currentCell)) {
        const neighbourPhero = neighbourCell.getPheromone(key, ant.colony, true)
        if (neighbourPhero > max) max = neighbourPhero
      }
      return max
    }
    const useMax = this.config.pheromones.useMax

    if (currentCell !== null && !ant.isDead) {
      if (ant.carryingFood) {
        this._leavePheromone(
          'food',
          currentCell,
          useMax ? getMaxPheromone(this, 'food', CellType.FOOD) : quantity,
          ant.colony
        )
      } else {
        this._leavePheromone(
          'home',
          currentCell,
          useMax ? getMaxPheromone(this, 'home', CellType.HOME) : quantity,
          ant.colony
        )
      }
      this.pheromoneCells.add(currentCell)
    }
    // danger pheromone, left in the cell when the ant dies
    // and isn't holding food
    // TODO: hasn't picked up food during its lifetime?
    if (
      this.config.pheromones.useDanger &&
      currentCell !== null &&
      ant.justDied &&
      !ant.carryingFood
    ) {
      //console.log('dropped death phero at', currentCell.x, currentCell.y)
      this._leavePheromone(
        'danger',
        currentCell,
        this.config.pheromones.deathQuantity,
        ant.colony
      )
      this.pheromoneCells.add(currentCell)
      ant.justDied = false // TODO NOTE could also have the corpse produce death pheromone for some time
    }
  }

  // added
  _leavePheromone(key, currentCell, quantity, colony, diffusing = false) {
    if (quantity <= 0) {
      // no pheromone actually added
      //console.log('negative',key,'pheromone:',quantity)
      return
    }
    const currentAmount = currentCell.getPheromone(key, colony)
    // Use top-off from paper
    if (this.config.pheromones.useTopOff && currentAmount >= quantity) return
    currentCell.addPheromone(
      key,
      quantity,
      diffusing
        ? this.config.pheromones.diffusionScale
        : this.config.pheromones.dropScale,
      colony
    )
    if (diffusing) this.diffuseAmount += quantity
    if (currentAmount > this.maxPheromone) {
      this.maxPheromone = currentAmount
    }
  }

  // Added pheromone diffusion
  _diffusePheromones() {
    const newPheroCells = new Set(this.pheromoneCells)
    //let logs = 0
    for (let cell of this.pheromoneCells) {
      for (let currentCell of this._neighbouringCells(cell)) {
        //console.log('center cell:',cell.x,',',cell.y,'neighbour:',cell.x+direction.x,cell.y+direction.y,'directions:',direction.x,direction.y)

        let changed = false
        const pheroConfig = this.config.pheromones
        for (let [key, diffusion] of [
          ['food', pheroConfig.foodDiffusion],
          ['home', pheroConfig.homeDiffusion],
          ['danger', pheroConfig.dangerDiffusion],
        ]) {
          const originalAmount = cell.getPheromone(key, 0)
          if (originalAmount && originalAmount > 0) {
            changed = true
            const amount = originalAmount * diffusion

            /*if (logs < 10 && this.tick % 10 == 0) {
              console.log(key,currentCell.x,currentCell.y,originalAmount)
              logs++
            }*/
            this._leavePheromone(key, currentCell, amount, 0, true)
            //if (!this.pheromoneCells.has(currentCell))
          }
        }
        if (changed) newPheroCells.add(currentCell)
      }
    }
    //console.log([...newPheroCells].filter(x => !this.pheromoneCells.has(x)))
    //const oldCells = this.pheromoneCells
    this.pheromoneCells = newPheroCells
    /*if (this.tick % 10 !== 0) {
      return
    }
    if (this.tick <= this.config.simTime)
      console.log(
        'tick',
        this.tick,
        'old',
        oldCells.size,
        'new',
        this.pheromoneCells.size,
        'diff',
        this.pheromoneCells.size - oldCells.size
      )*/
    //console.log([...this.pheromoneCells].every(x => oldCells.has(x)),[...this.pheromoneCells].filter(x => oldCells.has(x)))
  }

  /**
   * Decay the pheromones over time.
   */
  _decayPheromone() {
    let cellsToDelete = []

    //console.log(this.pheromoneCells)
    for (let cell of this.pheromoneCells) {
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
        // limit ant population to max
        colony.numberOfAnts <=
          this.config.ants.maxPopulation +
            this.config.ants.bornPopulationAbsolute &&
        colony.food >= this.config.food.birthsThreshold &&
        colony.numberOfAnts >= this.config.ants.minimumAntsForCreation &&
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
    const fixedBirthValue =
      /*int(
      this.config.ants.bornPopulationPercent * colony.numberOfAnts
    )*/ this.config.ants.bornPopulationAbsolute
    /*const numOfNewAnts = this.randomIntFromInterval(
      fixedBirthValue / this.config.ants.bornDeviation,
      fixedBirthValue * this.config.ants.bornDeviation
    )*/
    const numOfNewAnts = fixedBirthValue

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
    //noStroke()
    stroke('rgba(100, 100, 100, 0.2)')
    strokeWeight(1)

    // TODO refactor
    if (this.config.map.drawPheromones) {
      const relativeAlpha = true
      const baseAlpha = 0.05
      const absoluteAlpha = 0.5
      // alpha based on pheromone concentration, multiplied by scale
      const alphaScale = 0.6 / this.maxPheromone
      //console.log('max phero', this.maxPheromone)
      this.pheromoneCells.forEach((cell) => {
        // TODO NOTE: only works for one colony
        // yellow danger colour
        const dangerColour = '255,255,70' //'155,20,20'
        for (let [key, rgb] of [
          ['food', '50,255,255'],
          ['home', '255,70,220'],
          ['danger', dangerColour],
        ]) {
          const pheromoneAmount = cell.getPheromone(key, 0)
          if (pheromoneAmount <= 0) continue
          //const alpha = relativeAlpha ? Math.max(0,Math.log(10*pheromoneAmount*alphaScale)) : absoluteAlpha
          const alpha = relativeAlpha
            ? baseAlpha + pheromoneAmount * alphaScale
            : absoluteAlpha
          fill('rgba(' + rgb + ',' + alpha.toFixed(2) + ')') // cyan = food phero
          drawCell(cell, this.config.map.drawScale)
        }
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

    if (this.config.map.obstacles) {
      this.walls.forEach((cell) => {
        fill('rgba(50,50,50,0.9)')
        drawCell(cell, this.config.map.drawScale)
      })
    }

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
    const pheroFoodCells = [...this.pheromoneCells].filter(
      (x) => x.pheromones.food[0] > 0
    )
    const pheroHomeCells = [...this.pheromoneCells].filter(
      (x) => x.pheromones.home[0] > 0
    )
    const pheroDangerCells = [...this.pheromoneCells].filter(
      (x) => x.pheromones.danger[0] > 0
    )
    let prettyString = `Tick: ${this.tick}<br>Cells with pheromone in set: ${
      this.pheromoneCells.size
    }<br>
    Cells with food pheromone: ${pheroFoodCells.length}<br>
    Cells with home pheromone: ${pheroHomeCells.length}<br>
    Cells with death pheromone: ${pheroDangerCells.length}<br>
    Intersection food and home: ${
      [...pheroFoodCells].filter((x) => pheroHomeCells.includes(x)).length
    }<br>
    Difference food and home: ${
      [...pheroFoodCells].filter((x) => !pheroHomeCells.includes(x)).length
    }<br>
    Diffused amount: ${this.diffuseAmount}<br>
    Food pheromone: ${this.foodPheroAmount}<br>
    Home pheromone: ${this.homePheroAmount}<br>
    Death pheromone: ${this.dangerPheroAmount}<br>
    `
    /* if (this.tick <= this.config.simTime && this.tick % 10 == 0) {
      console.log(prettyString)
      console.log(
        this.tick,
        pheroFoodCells.length == pheroHomeCells.length &&
          [...pheroFoodCells].every((x) => pheroHomeCells.includes(x))
          ? ''
          : 'NOT EQUAL',
        [...pheroFoodCells].filter((x) => pheroHomeCells.includes(x))
      )
    }*/
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
      danger: 0,
    }
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        const cleanResult = cell.cleanPheromones()
        cleanedPheromoneColonyCells.food += cleanResult.food
        cleanedPheromoneColonyCells.home += cleanResult.home
        cleanedPheromoneColonyCells.danger += cleanResult.danger
      })
    })
    console.log(
      `Cleaned pheromones: food - ${cleanedPheromoneColonyCells.food}   home - ${cleanedPheromoneColonyCells.home}    danger - ${cleanedPheromoneColonyCells.danger}`
    )
  }
}
