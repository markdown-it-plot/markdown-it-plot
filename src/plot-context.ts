import { PlotObject } from "./objects/plot-object";
import { UDV, UDF } from "./tokenizer";
import { map } from "d3";

export class PlotContext {

    currentCmd: string

    terminal = 'svg'
    terminalOptions: any

    title: string
    width = 600
    height = 400
    x1Label: string
    y1Label: string
    x2Label: string
    y2Label: string
    x1Range: number[]
    x2Range: number[]
    y1Range: number[]
    y2Range: number[]
    dummies: string[] = ['x']
    udfTable: Map<string, UDF> = new Map<string, UDF>()
    udvTable: Map<string, UDV> = new Map<string, UDV>()
    objects: PlotObject[] = new Array

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

