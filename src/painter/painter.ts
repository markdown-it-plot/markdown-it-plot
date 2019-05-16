import { PlotContext } from "../plot-context";
import * as d3 from 'd3'
import { ExpressionObject } from "../objects/expression-object";
import { ValueType, Value } from "../tokenizer";
import { LineStyles } from "../styles";
import { Colors } from "../colors";
import { ArrowObject, ArrowEndType } from "../objects/arrow";
import { Point } from "../graph";
import { PlotObject, RectangleObject, CircleObject, EllipseObject } from "../objects/plot-object";
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
        let context = PlotContext.get()
        this.$svg = d3.select(container).append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('width', context.width).attr('height', context.height)
            .attr('viewBox', `0 0 ${context.width} ${context.height}`)
    }

    paint(context: PlotContext) {
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
        let width = context.width - 2 * this.canvasMargin
        let height = context.height - 2 * this.canvasMargin
        this.$canvas = this.$svg.append('g').attr('class', 'canvas')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
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
        this.$canvas.append("g").attr('class', 'grid').attr("transform", `translate(0,0)`)
            .call(this.y1axis)

        // no grid
        //this.x1axis = d3.axisBottom(d3.scaleLinear().domain([-10, 10]).range([0, Number.parseInt(this.$canvas.attr('width'))]))
        //this.y1axis = d3.axisLeft(d3.scaleLinear().domain([10, -10]).range([0, Number.parseInt(this.$canvas.attr('height'))]))
        // this.$canvas.append("g").attr("transform", `translate(0,${this.$canvas.attr('height')})`).call(this.x1axis)
        // this.$canvas.append("g").attr("transform", `translate(0,0)`).call(this.y1axis)
    }

    paintObjects() {
        let objects = PlotContext.get().objects
        this.paintArrows(objects.arrow)
        this.paintShapes(objects.shapes)
        LineStyles.reset()
        objects.expression.forEach(o => this.paintExpression(o))
    }

    paintShapes(shapes: PlotObject[]) {
        shapes.forEach(s => {
            console.info(s)
            if (s instanceof RectangleObject) {
                let rect = s as RectangleObject
                let x = this.x1axis.scale()(rect.x)
                let y = this.y1axis.scale()(rect.y)
                let width = this.x1axis.scale()(rect.x + rect.width) - x
                let height = this.y1axis.scale()(rect.y + rect.height) - y
                x = width >= 0 ? x : x + width
                y = height >= 0 ? y : y + height
                width = Math.abs(width)
                height = Math.abs(height)
                this.$canvas.append('g').append('rect')
                    .attr('x', x).attr('y', y)
                    .attr('width', width)
                    .attr('height', height)
                    .attr('stroke', 'black').attr('fill', 'none');
            } else if (s instanceof EllipseObject) {
                let ellipse = s as EllipseObject
                let cx = this.x1axis.scale()(ellipse.cneter.x)
                let cy = this.y1axis.scale()(ellipse.cneter.y)
                let rx = this.x1axis.scale()(ellipse.size.x) - this.x1axis.scale()(0)
                let ry = this.x1axis.scale()(ellipse.size.y) - this.x1axis.scale()(0)
                this.$canvas.append('g').append('ellipse')
                    .attr('cx', cx).attr('cy', cy).attr('rx', rx).attr('ry', ry)
                    .attr('stroke', 'black').attr('fill', 'none');
            } else if (s instanceof CircleObject) {
                let circle = s as CircleObject
                let cx = this.x1axis.scale()(circle.cneter.x)
                let cy = this.y1axis.scale()(circle.cneter.y)
                let r = this.x1axis.scale()(circle.radius) - this.x1axis.scale()(0)
                this.$canvas.append('g').append('circle')
                    .attr('cx', cx).attr('cy', cy).attr('r', r)
                    .attr('stroke', 'black').attr('fill', 'none');
            }
        })
    }

    paintExpression(obj: ExpressionObject) {
        let context = PlotContext.get()
        let samples = linspace(context.x1Range.lower, context.x1Range.upper, 500)
        let gen = d3.line<number>()
            .x((d) => this.x1axis.scale()(d))
            .y((d) => {
                let v = new Value({ type: ValueType.FLOAT, num_v: d })
                let r = obj.expression.eval([v])
                return this.y1axis.scale()(r.num_v)
            })
            .curve(d3.curveBasis)
        let color = Colors.get(LineStyles.next().color);
        this.$canvas.append('g').append('path').attr('d', gen(samples)).attr('stroke', color).attr('fill', 'none')
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
            let $line = this.$canvas.append('g').append('line').attr('stroke', Colors.get('black'))
                .attr('x1', this.x1axis.scale()(a.start.x)).attr('y1', this.y1axis.scale()(a.start.y))
                .attr('marker-end', 'url(#arrow)')
            console.info(a)
            if (a.type == ArrowEndType.Absolute) {
                $line.attr('x2', this.x1axis.scale()(a.end.x)).attr('y2', this.y1axis.scale()(a.end.y))
            } else if (a.type == ArrowEndType.Relative) {
                $line.attr('x2', this.x1axis.scale()(a.start.x + a.end.x)).attr('y2', this.y1axis.scale()(a.start.y + a.end.y))
            } else if (a.type == ArrowEndType.Oriented) {
                throw "unsuppot oriented arrow now!!"
            }
        })

    }

    getDefs() {
        return this.$svg.select('defs').empty() ? this.$svg.append('defs') : this.$svg.select('defs')
    }



}
