import { Expression } from "../expression/expression";
import { PlotObject } from "./plot-object";
import { Point } from "../graph";

export class ExpressionObject implements PlotObject {

    constructor(init: ExpressionObject) {
        init && Object.assign(this, init)
    }

    expression: Expression

    samples?: Point[] = new Array

}