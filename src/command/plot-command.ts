import { Command } from './command'
import { Tokenizer, UDF } from '../tokenizer';
import { PlotContext } from '../plot-context';
import { TerminalFactory } from '../teriminal/teriminals';
import { ExpressionParser } from '../expression/expression';
import { ExpressionObject } from '../objects/expression-object';

export class PlotCommand implements Command {

    constructor(private tokenizer: Tokenizer, private context: PlotContext) { }

    names(): string[] {
        return ['p', 'plot']
    }
    help(): string {
        return 'no help yet.'
    }
    execute(): void {
        this.parseAndEvalExpression()
        this.configAxises()
        this.paint()

    }
    parseAndEvalExpression() {
        let exp = new ExpressionParser(this.tokenizer, new UDF({ name: "", dummies: PlotContext.get().dummies })).parse()
        PlotContext.get().objects.push(new ExpressionObject({ expression: exp }))
        while (this.tokenizer.checkEquals(',')) {
            this.tokenizer.forward()
            exp = new ExpressionParser(this.tokenizer, new UDF({ name: "", dummies: PlotContext.get().dummies })).parse()
            PlotContext.get().objects.push(new ExpressionObject({ expression: exp }))
        }
    }

    configAxises() {

    }

    paint() {
        let painter = TerminalFactory.createTerminal().createPainter({})
        painter.paint(this.context)
    }
}