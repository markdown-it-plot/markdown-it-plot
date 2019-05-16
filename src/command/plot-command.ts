import { Command } from './command'
import { Tokenizer, UDF } from '../tokenizer';
import { PlotContext } from '../plot-context';
import { TerminalFactory } from '../teriminal/teriminals';
import { ExpressionParser } from '../expression/expression';
import { ExpressionObject } from '../objects/expression-object';
import { AxisRange } from '../axis';
import { TokenUtil } from '../utils';
import { ParseError } from '../parse-error';

export class PlotCommand implements Command {

    constructor(private tokenizer: Tokenizer) { }

    names(): string[] {
        return ['p', 'plot']
    }
    help(): string {
        return 'no help yet.'
    }
    execute(): void {

        this.initAxises()
        this.parseAndEvalExpression()
        this.paint()

    }
    initAxises() {
        let context = PlotContext.get()
        this.parseRange(context.x1Range, true, [-10, 10])
        this.parseRange(context.y1Range, false)
        this.parseRange(context.x2Range, false)
        this.parseRange(context.y2Range, false)
    }

    parseRange(range: AxisRange, extractDummy: boolean, defaultRange = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {

        if (!this.tokenizer.checkEquals('[')) {
            return;
        }
        this.tokenizer.forward()


        let dummy = null;
        if (this.tokenizer.check(TokenUtil.isLetter) && this.tokenizer.checkForwardEquals(1, "=")) {
            dummy = this.tokenizer.currentText()
            this.tokenizer.forward(2)
        }

        this.parseBoundary(range, 'lower', defaultRange)
        if (!this.tokenizer.checkEquals(':') && !this.tokenizer.checkEquals('to')) {
            throw ParseError.byCurrentToken(this.tokenizer, 'range upper expected')
        }
        this.tokenizer.forward()

        if (!this.tokenizer.checkEquals(']')) {
            this.parseBoundary(range, 'upper', defaultRange)
        }

        if (!this.tokenizer.checkEquals(']')) {
            throw ParseError.byCurrentToken(this.tokenizer, '] expected')
        }
        this.tokenizer.forward()

        if (dummy && extractDummy) {
            PlotContext.get().dummies[0] = dummy
        }
    }
    parseBoundary(range: AxisRange, boundary: string, defaultRange: number[]) {
        if (this.tokenizer.checkEquals(']') || this.tokenizer.checkEquals(':') || this.tokenizer.checkEquals('to')) {
            return;
        }

        if (this.tokenizer.checkEquals('*')) {
            if (boundary == 'lower') {
                range.autoLower = true
                range.lower = defaultRange[0]
            } else if (boundary == 'upper') {
                range.autoUpper = true
                range.upper = defaultRange[1]
            }
            this.tokenizer.forward()
        }else {
            let exp = new ExpressionParser(this.tokenizer, new UDF({ name: "", dummies: [] })).parse()
            let v = exp.eval([])
            if (boundary == 'lower') {
                range.autoLower = false
                range.lower = v.num_v
            } else if (boundary == 'upper') {
                range.autoUpper = false
                range.upper = v.num_v
            }
        }

    }


    parseAndEvalExpression() {
        let exp = new ExpressionParser(this.tokenizer, new UDF({ name: "", dummies: PlotContext.get().dummies })).parse()
        PlotContext.get().objects.expression.push(new ExpressionObject({ expression: exp }))
        while (this.tokenizer.checkEquals(',')) {
            this.tokenizer.forward()
            exp = new ExpressionParser(this.tokenizer, new UDF({ name: "", dummies: PlotContext.get().dummies })).parse()
            PlotContext.get().objects.expression.push(new ExpressionObject({ expression: exp }))
        }
    }


    paint() {
        let painter = TerminalFactory.createTerminal().createPainter({})
        painter.paint(PlotContext.get())
    }
}