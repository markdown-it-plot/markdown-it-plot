import { Tokenizer } from "./tokenizer";
import { TokenUtil } from "./utils";
import { ParseError } from "./parse-error";

export class Point {
    constructor(init?:Point){
        init && Object.assign(this,init)
    }
    x: number = 0
    y: number = 0
    z?: number = 0

}

export class PointParser {
    static parse(tokenizer: Tokenizer, dims = 2): Point {
        if (dims == 2) {
            if (tokenizer.check(TokenUtil.isFloat) && tokenizer.checkForwardEquals(1, ',') && tokenizer.checkForward(2, TokenUtil.isFloat)) {
                let point = new Point
                point.x = tokenizer.current().value.num_v
                tokenizer.forward(2)
                point.y = tokenizer.current().value.num_v
                tokenizer.forward()
                return point
            } else {
                throw ParseError.byCurrentToken(tokenizer, "invalid point format!!")
            }

        } else {
            throw "unsupport dims more than 2"
        }
    }
}