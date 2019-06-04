import { PlotObject } from "./plot-object";
import { triggerAsyncId } from "async_hooks";
import { Point } from "../graph";

export class PointObject implements PlotObject {
    constructor(init?: PointObject) {
        init && Object.assign(this, init)
    }
    tag: string
    label?: string
    point: Point = new Point
}