class Ant {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.carryingFood = false;
    this.isDead = false;

    this.angle = 0;
    this.directions = [
      {x: 0, y: -1}, //N
      {x: 1, y: -1}, //NE
      {x: 1, y: 0},  //E
      {x: 1, y: 1},  //SE
      {x: 0, y: 1},  //S
      {x: -1, y: 1}, //SW
      {x: -1, y: 0}, //W
      {x: -1, y: -1} //NW
    ];

  }

  forward() {
    return this.directions[this.angle];
  }

  turnLeft() {
    this.angle -= 1;
    if (this.angle < 0) {
      this.angle = this.directions.length - 1;
    }
  }

  turnRight() {
    this.angle += 1;
    this.angle = this.angle % this.directions.length;
  }

  moveRandomly(gameSpeed) {
    let fwd = this.forward();
    let action = floor(random(0, 6));
    //Slightly more likely to move forwards than to turn
    if (action < 4) {
      this.x += fwd.x * gameSpeed;
      this.y += fwd.y * gameSpeed;
    } else if (action === 4) {
      this.turnLeft();
    } else if (action === 5) {
      this.turnRight();
    }
  }
}


class Pheromones {
  constructor(food = 0, home = 0) {
    this.food = food;
    this.home = home;
  }
}

const CellType = {
  EMPTY: 0,
  FOOD: 1,
  HOME: 2,
  WALL: 3
};


class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.type = CellType.EMPTY;
    this.pheromones = new Pheromones();
  }
}
