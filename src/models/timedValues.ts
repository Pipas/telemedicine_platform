/**
 * Represents an array of values that all correspond to the same time
 *
 * @export
 * @class TimedValues
 */
export class TimedValues {
  time: number
  values: number[]

  constructor(time: number, values: number[]) {
    this.time = time
    this.values = values
  }
}
