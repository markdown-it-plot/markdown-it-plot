import { PlotContext } from "../plot-context";
import * as d3 from 'd3'
import { ExpressionObject } from "../objects/expression-object";
import { ValueType, Value } from "../tokenizer";
import { LineStyles } from "../styles";
import { Colors } from "../colors";
let linspace = require('linspace')

export interface Painter {

    paint(context: PlotContext): void
}

export class SVGPainter implements Painter {

    $svg: d3.Selection<SVGSVGElement, {}, null, undefined>;
    x1axis: d3.Axis<any>
    y1axis: d3.Axis<any>

    constructor(private container: HTMLElement) {
        this.$svg = d3.select(container).append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg')
    }

    paint(context: PlotContext) {
        this.$svg.attr('width', context.width).attr('height', context.height)
        this.initAxises()
        this.paintObjects()
    }

    initAxises() {
        this.x1axis = d3.axisBottom(d3.scaleLinear().domain([-10, 10]).range([0, 500]))
        this.$svg.append("g").attr("transform", "translate(40,0)").call(this.x1axis)
        this.y1axis = d3.axisLeft(d3.scaleLinear().domain([10, -10]).range([0, 300]))
        this.$svg.append("g").attr("transform", "translate(40,0)").call(this.y1axis)
    }

    paintObjects() {
        let objects = PlotContext.get().objects
        LineStyles.reset()
        objects.forEach((o) => {
            if (o instanceof ExpressionObject) {
                this.paintExpression(o)

            }
        })
    }

    paintExpression(obj: ExpressionObject) {
        let samples = linspace(-10, 10, 500)
        let gen = d3.line<number>()
            .x((d) => this.x1axis.scale()(d))
            .y((d) => {
                let v = new Value({ type: ValueType.FLOAT, num_v: d })
                let r = obj.expression.eval([v])
                return this.y1axis.scale()(r.num_v)
            })
            .curve(d3.curveBasis)
        let color = Colors.get(LineStyles.next().color);
        this.$svg.append('path').attr('d', gen(samples)).attr('stroke', color).attr('fill', 'none')
    }


}