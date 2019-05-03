import { ParseError } from "./parse-error";
import { AlphaUtil } from "./utils";
import { Expression } from "./expression/expression";


export class Complex {
    constructor(init?: Complex) {
        init && Object.assign(this, init)
    }
    real: number
    imaginary: number
}

/**
 * user-defined variable 
 */
export class UDV {
    constructor(init?: UDV) {
        init && Object.assign(this, init)
    }
    name: string
    value?: Value
}

/**
 * user-defined function 
 */
export class UDF {
    constructor(init?: UDF) {
        init && Object.assign(this, init)
    }
    name: string
    expression?: Expression
    dummies?:string[]
}

export class Value {
    constructor(init?: Value) {
        init && Object.assign(this, init)
    }
    num_v?: number
    string_v?: string
    complex_v?: Complex
    type?: ValueType
}


export class Token {
    constructor(init?: Token) {
        init && Object.assign(this, init)
    }
    text: string
    start: number

    value?: Value = new Value()
    isToken?: boolean = true
}

export enum ValueType {
    INTGR = 'INTGR',
    FLOAT = 'FLOAT',
    CMPLX = 'CMPLX',
    STRING = 'STRING',
    DATABLOCK = 'DATABLOCK',
    ARRAY = 'ARRAY',
    VOXELGRID = 'VOXELGRID',
    NOTDEFINDED = 'NOTDEFINDED',
    INVALID_VALUE = 'INVALID_VALUE',
    INVALID_NAME = 'INVALID_NAME'
}

export class Tokenizer {

    tokens: Token[] = new Array

    point: number = 0

    constructor(private origin: string) {
        for (let i = 0; i < origin.length;) {

            let c = origin.charAt(i);
            if (c == ' ' || c == '\t') {
                i++;
                continue
            }

            if (c == '`') {
                throw ParseError.of(origin, 'not support yet!', i)
            } else if (AlphaUtil.isAlpha(c)) {
                let token = TokenizerUtil.getIdentWord(origin, i)
                this.tokens.push(new Token({
                    text: token,
                    start: i,
                }))
                i = i + token.length
            } else if (AlphaUtil.isDigit(c)) {
                let token = TokenizerUtil.getNumericToken(origin, i)
                this.tokens.push(token)
                i = i + token.text.length
            } else if (c == '.' && AlphaUtil.isDigit(origin.charAt(i + 1))) {
                let token = TokenizerUtil.getNumericToken(origin, i);
                this.tokens.push(token);
                i = i + token.text.length;
            }
            // 复数
            else if (c == '{') {
                throw ParseError.of(origin, 'not support yet!', i)
            } else if (c == '"' || c == "'") {
                let token = TokenizerUtil.getMatchString(origin, i)
                this.tokens.push(new Token({
                    text: token,
                    start: i,
                    value: new Value({
                        type: ValueType.STRING
                    })
                }))
                i = i + token.length
            }

            else {
                switch (c) {
                    case '#':
                        return
                    case '^':
                    case '+':
                    case '-':
                    case '/':
                    case '%':
                    case '~':
                    case '(':
                    case ')':
                    case '[':
                    case ']':
                    case ';':
                    case ':':
                    case '?':
                    case ',':
                    case '$':
                        this.tokens.push({
                            text: origin.substring(i, i + 1),
                            start: i
                        })
                        i++
                        break;
                    case '&':
                    case '|':
                    case '=':
                    case '*':
                        if (c == origin.charAt(i + 1)) {
                            this.tokens.push({
                                text: origin.substring(i, i + 2),
                                start: i
                            })
                            i += 2
                        } else {
                            this.tokens.push({
                                text: origin.substring(i, i + 1),
                                start: i
                            })
                            i++
                        }
                        break;
                    case '!':
                    case '>':
                        if (origin.charAt(i + 1) == '=' || origin.charAt(i + 1) == '>') {
                            this.tokens.push({
                                text: origin.substring(i, i + 2),
                                start: i
                            })
                            i += 2
                        } else {
                            this.tokens.push({
                                text: origin.substring(i, i + 1),
                                start: i
                            })
                            i++
                        }
                        break;
                    case '<':
                        if (origin.charAt(i + 1) == '=' || origin.charAt(i + 1) == '<') {
                            this.tokens.push({
                                text: origin.substring(i, i + 2),
                                start: i
                            })
                            i += 2
                        } else {
                            this.tokens.push({
                                text: origin.substring(i, i + 1),
                                start: i
                            })
                            i++
                        }
                        break;
                    default:
                        throw <ParseError>{
                            text: origin,
                            start: i,
                            message: `unexpect char (${c})`
                        }
                }

            }
        }
    }

    forward(step = 1) {
        this.point += step
    }

    get(i: number): Token {
        return this.tokens[i]
    }

    getOrigin(): string {
        return this.origin
    }

    reset(i = 0) {
        this.point = i;
    }

    current(): Token {
        return this.tokens[this.point]
    }

    last(): Token {
        return this.tokens[this.tokens.length - 1]
    }

    check(fun: Function) {
        return this.current() && fun(this.current())
    }

    currentText() {
        return this.current().text
    }

    checkEquals(target: string) {
        return this.current() && this.current().text == target
    }

    checkForwardEquals(step: number, target: string) {
        return this.checkForward(step, (t: Token) => t.text == target)
    }

    checkForward(step: number, fun: Function) {
        return this.point + step < this.tokens.length && fun(this.tokens[this.point + step])
    }

}

class TokenizerUtil {


    static getIdentWord(text: string, start: number): string {
        let current = start;
        while (current < text.length) {
            if (AlphaUtil.isIdent(text.charAt(current + 1))) {
                current++
            } else {
                break;
            }
        }
        return text.substring(start, current + 1);
    }

    static getMatchString(line: string, start: number): string {
        let quote = line.charAt(start);
        let current = start + 1;
        while (current < line.length) {
            if (line.charAt(current) == quote && line.charAt(current - 1) != '\\') {
                break;
            }
            current++;
        }
        if (line.charAt(current) == quote) {
            return line.substring(start, current + 1)
        } else {
            throw <ParseError>{
                text: line,
                start: start,
                message: `no match quote (${quote})`
            }
        }
    }

    static getNumericToken(line: string, start: number): Token {
        let token = new Token
        token.isToken = false;
        token.value.type = ValueType.INTGR

        let current = start
        while (AlphaUtil.isDigit(line.charAt(current))) {
            current++
        }
        if (line.charAt(current) == '.') {
            current++

            token.value.type = ValueType.FLOAT
            while (AlphaUtil.isDigit(line.charAt(current))) {
                current++
            }
        }

        if (line.charAt(current) == 'e' || line.charAt(current) == 'E') {
            current++
            token.value.type = ValueType.FLOAT
            if (line.charAt(current) == '+' || line.charAt(current) == '-') {
                current++
            }
            if (!AlphaUtil.isDigit(line.charAt(current))) {
                throw ParseError.of(line, "unexpect char when parse numberic.", current)
            }
            while (AlphaUtil.isDigit(line.charAt(current))) {
                current++
            }
        }

        let exp = line.substring(start, current)
        token.value.num_v = token.value.type == ValueType.INTGR ? Number.parseInt(exp) : Number.parseFloat(exp)
        token.text = exp
        token.start = start
        return token
    }
}

