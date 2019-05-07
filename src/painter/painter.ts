import { PlotContext } from "../plot-context";
import * as d3 from 'd3'
import { ExpressionObject } from "../objects/expression-object";
import { ValueType, Value } from "../tokenizer";
import { LineStyles } from "../styles";
import { Colors } from "../colors";
import { ArrowObject, ArrowEndType } from "../objects/arrow";
import { Point } from "../graph";
let linspace = require('linspace')

export interface Painter {

    paint(context: PlotContext): void
}

export class SVGPainter implements Painter {

    $svg: d3.Selection<SVGSVGElement, {}, null, undefined>;
    $canvas: d3.Selection<SVGGElement, {}, null, undefined>;
    x1axis: d3.Axis<any>
    y1axis: d3.Axis<any>
    canvasMargin = 30
    axisMargin = 20

    constructor(private container: HTMLElement) {
        this.$svg = d3.select(container).append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg')
    }

    paint(context: PlotContext) {
        this.$svg.attr('width', context.width).attr('height', context.height)
        this.initCanvas(context)
        this.sampleExpressions()
        this.initAxises()
        this.paintObjects()
    }
    sampleExpressions() {
        let context = PlotContext.get()

        context.objects.expression.forEach(o => {
            let samples: Array<number> = linspace(context.x1Range.lower, context.x1Range.upper, 500)
            o.samples = samples.map(s => {
                let r = o.expression.eval([new Value({ type: ValueType.FLOAT, num_v: s })])
                return new Point({ x: s, y: r.num_v })
            })

            let max = d3.max(o.samples.map(p => p.y))
            if (context.y1Range.autoUpper) {
                context.y1Range.upper = Math.max(max, context.y1Range.upper)
            }

            let min = d3.min(o.samples.map(p => p.y))
            if (context.y1Range.autoLower) {
                context.y1Range.lower = Math.min(min, context.y1Range.lower)
            }
        })
    }

    initCanvas(context: PlotContext) {
        this.$canvas = this.$svg.append('g').attr('class', 'canvas')
            .attr('width', context.width - 2 * this.canvasMargin)
            .attr('height', context.height - 2 * this.canvasMargin)
            .attr("transform", `translate(${this.canvasMargin},${this.canvasMargin})`)
    }

    initAxises() {
        let context = PlotContext.get()
        let x1scale = d3.scaleLinear().domain([context.x1Range.lower, context.x1Range.upper]).range([0, Number.parseInt(this.$canvas.attr('width'))])
        let y1scale = d3.scaleLinear().domain([context.y1Range.upper, context.y1Range.lower]).range([0, Number.parseInt(this.$canvas.attr('height'))])
        //grid
        this.x1axis = d3.axisBottom(x1scale).tickSize(-Number.parseInt(this.$canvas.attr('height')))
        this.y1axis = d3.axisLeft(y1scale).tickSize(-Number.parseInt(this.$canvas.attr('width')))
        this.$canvas.append("g").attr('class', 'grid').attr("transform", `translate(0,${this.$canvas.attr('height')})`)
            .call(this.x1axis)
        this.$canvas.append("g").attr('class', 'grid').attr("transform", `translate(0,0))`)
            .call(this.y1axis)

        // no grid
        //this.x1axis = d3.axisBottom(d3.scaleLinear().domain([-10, 10]).range([0, Number.parseInt(this.$canvas.attr('width'))]))
        //this.y1axis = d3.axisLeft(d3.scaleLinear().domain([10, -10]).range([0, Number.parseInt(this.$canvas.attr('height'))]))
        // this.$canvas.append("g").attr("transform", `translate(0,${this.$canvas.attr('height')})`).call(this.x1axis)
        // this.$canvas.append("g").attr("transform", `translate(0,0))`).call(this.y1axis)
    }

    paintObjects() {
        let objects = PlotContext.get().objects
        this.paintArrows(objects.arrow)
        LineStyles.reset()
        objects.expression.forEach(o => this.paintExpression(o))
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
        this.$canvas.append('path').attr('d', gen(samples)).attr('stroke', color).attr('fill', 'none')
    }

    paintArrows(arrows: ArrowObject[]) {
        let $defs = this.getDefs()
        if ($defs.select('#arrow').empty()) {
            let $arrowMarker = $defs.append('marker').attr('id', 'arrow').attr('markerUnits', 'strokeWidth')
                .attr('markerWidth', 12).attr('markerHeight', 12).attr('viewBox', '0,0,12,12')
                .attr('refX', 6).attr('refY', 6).attr('orient', 'auto')
            $arrowMarker.append('path').attr('d', 'M2,2 L10,6 L2,10 L6,6 L2,2').attr('style', 'fill: #000000;')
        }
        arrows.forEach(a => {
            let $line = this.$canvas.append('line').attr('stroke', Colors.get('black'))
                .attr('x1', this.x1axis.scale()(a.start.x)).attr('y1', this.y1axis.scale()(a.start.y))
                .attr('marker-end', 'url(#arrow)')
            if (a.type == ArrowEndType.Absolute) {
                $line.attr('x2', this.x1axis.scale()(a.end.x)).attr('y2', this.y1axis.scale()(a.end.y))
            } else if (a.type == ArrowEndType.Relative) {
                $line.attr('x2', this.x1axis.scale()(a.start.x + a.end.x)).attr('y2', this.y1axis.scale()(a.start.y + a.end.y))
            }else if(a.type == ArrowEndType.Oriented){
                throw "unsuppot oriented arrow now!!"
            }
        })

    }

    getDefs() {
        return this.$svg.select('defs').empty() ? this.$svg.append('defs') : this.$svg.select('defs')
    }



}
