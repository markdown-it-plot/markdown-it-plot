export class Axis {
    label: string
    rangeMin: number
    rangeMax: number
    minAutoScale: boolean = true
    maxAutoScale: boolean = true

    // log axis control
    log: boolean /* log axis stuff: flag "islog?" */
    base: number /* logarithm base value */
    logBase: number /* ln(base), for easier computations */

    /* tick mark control

    tockMode:number;
    */
}