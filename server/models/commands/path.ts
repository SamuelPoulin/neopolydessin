export interface Coord {
  x: number;
  y: number;
}

export class Path {

  path: Coord[];

  constructor(startPoint?: Coord) {
    this.path = [];
    if (startPoint) {
      this.path.push(startPoint);
    }
  }

  addCoord(point: Coord) {
    if (!this.path.includes(point)) {
      this.path.push(point);
    }
  }

}