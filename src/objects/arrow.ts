import { Tokenizer } from "../tokenizer";
import { Point, PointParser } from "../graph";
import { ParseError } from "../parse-error";

enum ArrowEndType {
    Absolute,
    Relative,
    Oriented,
    Undefined
}

export class ArrowObject {
    tag: number
    start: Point
    end: Point
    type: ArrowEndType
}

export class ArrowParse {

    static parse(tokenizer: Tokenizer): ArrowObject {
        let set_start = false;
        let set_end = false;
        let duplication = false
        let arrow = new ArrowObject
        while (!tokenizer.isCommandEnd()) {
            if (tokenizer.checkEquals('from') || tokenizer.checkEquals('at')) {
                if (set_start) {
                    duplication = true;
                    break;
                }

                tokenizer.forward()
                if (tokenizer.isCommandEnd()) {
                    throw ParseError.byCommand(tokenizer.getOrigin(), "start coordinates expected")
                }
                arrow.start = PointParser.parse(tokenizer)
                set_start = true;
                continue
            } else if (tokenizer.checkEquals('to') || tokenizer.checkEquals('rto')) {
                if (set_end) {
                    duplication = true;
                    break;
                }
                arrow.type = tokenizer.checkEquals('to') ? ArrowEndType.Absolute : ArrowEndType.Relative
                tokenizer.forward()
                if (tokenizer.isCommandEnd()) {
                    throw ParseError.byCommand(tokenizer.getOrigin(), "end coordinates expected")
                }
                arrow.end = PointParser.parse(tokenizer)
                set_end = true;
                continue
            } else if (tokenizer.checkEquals('length')) {
                if (set_end) {
                    duplication = true;
                    break;
                }
                arrow.type = ArrowEndType.Oriented
                tokenizer.forward()
                if (tokenizer.isCommandEnd()) {
                    throw ParseError.byCommand(tokenizer.getOrigin(), "end coordinates expected")
                }
                arrow.end = PointParser.parse(tokenizer)
                set_end = true;
                continue
            } else if (tokenizer.checkEquals('angle')) {
                throw ParseError.byCurrentToken(tokenizer, "unsupport now!!")
            }

            if (!tokenizer.isCommandEnd()) {
                throw ParseError.byCurrentToken(tokenizer, "wrong argument in set arrow")
            }
        }

        if (duplication) {
            throw ParseError.byCurrentToken(tokenizer, "duplicate or contradictory arguments")
        }

        return arrow
    }
}