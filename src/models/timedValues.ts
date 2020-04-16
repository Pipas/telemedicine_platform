export class TimedValues {
  time: number
  values: number[]

  constructor(time: number, values: number[]) {
    this.time = time
    this.values = values
  }

  // toString(): string {
  //   return JSON.stringify({
  //     x: this.x,
  //     y: this.y
  //   })
  // }
}
