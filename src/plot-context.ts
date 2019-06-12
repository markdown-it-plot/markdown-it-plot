import { PlotObject } from "./objects/plot-object";
import { UDV, UDF } from "./tokenizer";
import { ExpressionObject } from "./objects/expression-object";
import { ArrowObject } from "./objects/arrow";
import { AxisRange } from "./axis";
import { PointObject } from "./objects/point-object";

export class PlotContext {

    currentCmd: string

    terminal = 'svg'
    terminalOptions: any

    options = {
        grid: true
    }

    title: string
    width = 600
    height = 400
    x1Label: string
    y1Label: string
    x2Label: string
    y2Label: string
    x1Range: AxisRange = new AxisRange({ lower: -10, upper: 10 })
    x2Range: AxisRange = new AxisRange({ lower: -10, upper: 10 })
    y1Range: AxisRange = new AxisRange({ lower: Number.POSITIVE_INFINITY, upper: Number.NEGATIVE_INFINITY })
    y2Range: AxisRange = new AxisRange({ lower: -10, upper: 10 })
    udfTable: Map<string, UDF> = new Map<string, UDF>()
    dummies: string[] = ['x']
    udvTable: Map<string, UDV> = new Map<string, UDV>()
    objects = {
        expression: new Array<ExpressionObject>(),
        arrow: new Array<ArrowObject>(),
        shapes: new Array<PlotObject>(),
        points: new Map<string, PointObject>()
    }




    image: any

    static instance = new PlotContext;


    static get() {
        return this.instance;
    }

    static reset() {
        this.instance = new PlotContext
        return this.instance
    }

    getDummyIndex(dummy: string) {
        for (let i = 0; i < this.dummies.length; i++) {
            if (dummy == this.dummies[i])
                return i;
        }
        return -1;
    }
}

