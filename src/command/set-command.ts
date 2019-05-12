import { Command } from "./command";
import { Tokenizer, Token, ValueType } from "../tokenizer";
import { PlotContext } from "../plot-context";
import { ParseError } from "../parse-error";
import { ArrowParse } from "../objects/arrow";
import { TokenUtil } from "../utils";
import { Point, PointParser } from "../graph";
import { RectangleObject, CircleObject } from "../objects/plot-object";

export class SetCommand implements Command {

    constructor(private tokenizer: Tokenizer) { }
    names(): string[] {
        throw new Error("Method not implemented.");
    }
    help(): string {
        throw new Error("Method not implemented.");
    }
    execute(): void {
        let context = PlotContext.get()

        if (this.tokenizer.checkEquals('arrow')) {
            this.tokenizer.forward()

            let arrow = ArrowParse.parse(this.tokenizer)
            PlotContext.get().objects.arrow.push(arrow)

        } else if (this.tokenizer.checkEquals('object')) {
            this.tokenizer.forward()

            let idx = context.objects.shapes.length
            if (this.tokenizer.check((t: Token) => {
                return !t.isToken && t.value.type == ValueType.INTGR
            })) {
                idx = this.tokenizer.current().value.num_v;
                this.tokenizer.forward();
            }
            let obj = null;
            if (this.tokenizer.checkEquals('rect') || this.tokenizer.checkEquals('rectangle')) {
                this.tokenizer.forward()
                obj = this.parseRectObject()
            } else if (this.tokenizer.checkEquals('ellipse')) {
                this.tokenizer.forward()
                obj = this.parseEllipseObject()
            } else if (this.tokenizer.checkEquals('circle')) {
                this.tokenizer.forward()
                obj = this.parseCircle()
            } else if (this.tokenizer.checkEquals('polygon')) {
                this.tokenizer.forward()
            }

            if (obj) {
                context.objects.shapes[idx] = obj
            }

        } else {
            throw ParseError.byCurrentToken(this.tokenizer, 'unexpected token!')
        }


    }
    parseCircle() {
        let obj = new CircleObject
        if (this.tokenizer.checkEquals('at') || this.tokenizer.checkEquals('center')) {
            this.tokenizer.forward()
            obj.cneter = PointParser.parse(this.tokenizer)
            if (this.tokenizer.checkEquals('size')) {
                this.tokenizer.forward()
                if (this.tokenizer.check(TokenUtil.isFloat)) {
                    obj.radius = this.tokenizer.current().value.num_v
                    this.tokenizer.forward()
                } else {
                    throw ParseError.byCurrentToken(this.tokenizer, 'Expecting a number for radius')
                }
            } else {
                throw ParseError.byCurrentToken(this.tokenizer, 'Expecting `size`')
            }
        } else {
            throw ParseError.byCurrentToken(this.tokenizer, 'Expecting `at` or `center`')
        }
        return obj
    }
    parseEllipseObject(): any {
        if (this.tokenizer.checkEquals('at') || this.tokenizer.checkEquals('center')) {
            this.tokenizer.forward()
            PointParser.parse(this.tokenizer)
            if (this.tokenizer.checkEquals('size')) {
                this.tokenizer.forward()
                PointParser.parse(this.tokenizer)
            } else {
                throw ParseError.byCurrentToken(this.tokenizer, 'Expecting `size`')
            }
        } else {
            throw ParseError.byCurrentToken(this.tokenizer, 'Expecting `at` or `center`')
        }

    }
    parseRectObject(): RectangleObject {
        let obj = new RectangleObject
        if (this.tokenizer.checkEquals('from')) {
            this.tokenizer.forward()
            let start = PointParser.parse(this.tokenizer)
            obj.x = start.x
            obj.y = start.y
            if (this.tokenizer.checkEquals('to')) {
                this.tokenizer.forward()
                let to = PointParser.parse(this.tokenizer)
                obj.width = to.x - start.x
                obj.height = to.y - start.y
            } else if (this.tokenizer.checkEquals('rto')) {
                this.tokenizer.forward()
                let rto = PointParser.parse(this.tokenizer)
                obj.width = rto.x
                obj.height = rto.y
            } else {
                throw ParseError.byCurrentToken(this.tokenizer, ' Expecting to or rto')
            }
        } else if (this.tokenizer.checkEquals('center')) {
            this.tokenizer.forward()
            let center = PointParser.parse(this.tokenizer)
            if (this.tokenizer.checkEquals('size')) {
                this.tokenizer.forward()
                let size = PointParser.parse(this.tokenizer)
                obj.x = center.x - size.x / 2
                obj.y = center.y - size.y / 2
                obj.width = size.x
                obj.height = size.y
            } else {
                throw ParseError.byCurrentToken(this.tokenizer, ' Expecting size')
            }
        } else if (this.tokenizer.checkEquals('at')) {
            this.tokenizer.forward()
            let center = PointParser.parse(this.tokenizer)
            if (this.tokenizer.checkEquals('size')) {
                this.tokenizer.forward()
                let size = PointParser.parse(this.tokenizer)
                obj.x = center.x
                obj.y = center.y
                obj.width = size.x
                obj.height = size.y
            } else {
                throw ParseError.byCurrentToken(this.tokenizer, ' Expecting size')
            }
        } else {
            throw ParseError.byCurrentToken(this.tokenizer, 'unexpected token')
        }
        return obj;
    }
}