import { Point } from "../graph";

export interface PlotObject {

}

export class RectangleObject implements PlotObject {
    x: number
    y: number
    width: number
    height: number
}

export class EllipseObject implements PlotObject {

}

export class CircleObject implements PlotObject {

    cneter: Point
    radius: number
}