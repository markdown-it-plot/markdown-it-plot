import { Expression } from "../expression/expression";
import { PlotObject } from "./plot-object";

export class ExpressionObject implements PlotObject{

    constructor(init: ExpressionObject) {
        init && Object.assign(this, init)
    }

    expression: Expression

}