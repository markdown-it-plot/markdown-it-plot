import { Tokenizer, Token, Value, ValueType, UDV, UDF } from "../tokenizer";
import { TokenUtil } from "../utils";
import { ParseError } from "../parse-error";
import { PlotContext } from "../plot-context";
import { values } from "d3";

let bool2int = (b: boolean | number) => b ? 1 : 0

class Helper {
    call_trigonometric_function(fun: Function) { }
}


let builtinTable: any = {
    push: (e: EvalContext, arg: Argument) => {

        if (arg.udv && arg.udv.value.type == ValueType.NOTDEFINDED) {
            throw "push udv not support yet"
        }
        e.push(arg.udv.value)

    },
    pushc: (e: EvalContext, arg: Argument) => {
        e.push(arg.value)
    },
    pushd1: (e: EvalContext, arg: Argument) => {
        let dummy = e.dummyValues[0]
        e.push( new Value(dummy))
    },
    pushd2: (e: EvalContext, arg: Argument) => {
        e.push(new Value(e.dummyValues[1]))
    },
    pushd: (e: EvalContext, arg: Argument) => {
        let value = e.pop()
        e.push(new Value(e.dummyValues[value.num_v]))
    },
    pop: (e: EvalContext, arg: Argument) => {
        e.pop()
    },
    call_builtin: (e: EvalContext, arg: Argument) => {
        builtinTable[arg.value.string_v](e, null)
        //throw "not support yet!"
    },
    call_udf: (e: EvalContext, arg: Argument) => {
        throw "not support yet!"
    },
    sum: (e: EvalContext, arg: Argument) => {
        throw "not support yet!"
    },
    lnot: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        ValueUtil.checkIfInt(v)
        v.num_v = bool2int(!v.num_v)
        e.push(v)

    },
    bnote: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        ValueUtil.checkIfInt(v)
        v.num_v = ~v.num_v
        e.push(v)

    },
    lor: (e: EvalContext, arg: Argument) => {
        let b = e.pop()
        let a = e.pop()
        ValueUtil.checkIfInt(a)
        ValueUtil.checkIfInt(b)
        a.num_v = bool2int(a.num_v || b.num_v)
        e.push(a)
    },

    land: (e: EvalContext, arg: Argument) => {
        let b = e.pop()
        let a = e.pop()
        ValueUtil.checkIfInt(a)
        ValueUtil.checkIfInt(b)
        a.num_v = bool2int(a.num_v && b.num_v)
        e.push(a)
    },

    bor: (e: EvalContext, arg: Argument) => {
        let b = e.pop()
        let a = e.pop()
        ValueUtil.checkIfInt(a)
        ValueUtil.checkIfInt(b)
        a.num_v = a.num_v | b.num_v
        e.push(a)
    },

    xor: (e: EvalContext, arg: Argument) => {
        let b = e.pop()
        let a = e.pop()
        ValueUtil.checkIfInt(a)
        ValueUtil.checkIfInt(b)
        a.num_v = a.num_v ^ b.num_v
        e.push(a)
    },

    band: (e: EvalContext, arg: Argument) => {
        let b = e.pop()
        let a = e.pop()

        ValueUtil.checkIfInt(a)
        ValueUtil.checkIfInt(b)
        a.num_v = a.num_v & b.num_v
        e.push(a)
    },

    uminus: (e: EvalContext, arg: Argument) => {
        let v = e.pop()

        switch (v.type) {
            case ValueType.INTGR:
            case ValueType.FLOAT:
                v.num_v = -v.num_v
                break;
            case ValueType.CMPLX:
                v.complex_v.imaginary = -v.complex_v.imaginary
                v.complex_v.real = -v.complex_v.real
                break;
            default:
                throw ` unsupport type for uminus operator: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    eq: (e: EvalContext, arg: Argument) => {
        let a = e.pop()
        let b = e.pop()
        let result;
        if (a.type == b.type) {
            switch (a.type) {
                case ValueType.INTGR:
                case ValueType.FLOAT:
                    result = bool2int(a.num_v == b.num_v)
                    break;
                case ValueType.CMPLX:
                    result = bool2int(a.complex_v.real == b.complex_v.real && a.complex_v.imaginary == b.complex_v.imaginary)
                    break;
                default:
                    throw ` unsupport type for eq operator : ${JSON.stringify([a, b])}`
            }
        } else {
            result = bool2int(false)
        }
        a.type = ValueType.INTGR
        a.num_v = result
        e.push(a)

    },
    ne: (e: EvalContext, arg: Argument) => {
        let b = e.pop()
        let a = e.pop()

        let result;
        if (a.type == b.type) {
            switch (a.type) {
                case ValueType.INTGR:
                case ValueType.FLOAT:
                    result = bool2int(a.num_v != b.num_v)
                    break;
                case ValueType.CMPLX:
                    result = bool2int(a.complex_v.real != b.complex_v.real || a.complex_v.imaginary != b.complex_v.imaginary)
                    break;
                default:
                    throw ` unsupport type for eq operator : ${JSON.stringify([a, b])}`
            }
        } else {
            result = bool2int(true)
        }
        a.type = ValueType.INTGR
        a.num_v = result
        e.push(a)

    },
    gt: (e: EvalContext, arg: Argument) => { },
    lt: (e: EvalContext, arg: Argument) => { },
    ge: (e: EvalContext, arg: Argument) => { },
    le: (e: EvalContext, arg: Argument) => { },
    leftshift: (e: EvalContext, arg: Argument) => { },
    rightshift: (e: EvalContext, arg: Argument) => { },
    plus: (e: EvalContext, arg: Argument) => {
        let b = e.pop()
        let a = e.pop()
        let result = new Value
        switch (a.type) {
            case ValueType.INTGR:
            case ValueType.FLOAT:
                if (ValueUtil.ifRealNumber(b)) {
                    result.num_v = a.num_v + b.num_v
                    result.type = (a.type == b.type && a.type == ValueType.INTGR) ? ValueType.INTGR : ValueType.FLOAT
                }
                else {
                    throw "unsupport cmplex number for plus operator yet"
                }
                break;
            default:
                throw "unsupport cmplex number for plus operator yet"
        }
        e.push(result)
    },
    minus: (e: EvalContext, arg: Argument) => {
        let b = e.pop()
        let a = e.pop()
        let result = new Value
        switch (a.type) {
            case ValueType.INTGR:
            case ValueType.FLOAT:
                if (ValueUtil.ifRealNumber(b)) {
                    result.num_v = a.num_v - b.num_v
                    result.type = (a.type == b.type && a.type == ValueType.INTGR) ? ValueType.INTGR : ValueType.FLOAT
                }
                else {
                    throw "unsupport cmplex number for minus operator yet"
                }
                break;
            default:
                throw "unsupport cmplex number for minus operator yet"
        }
        e.push(result)
    },
    mult: (e: EvalContext, arg: Argument) => {
        let b = e.pop()
        let a = e.pop()
        let result = new Value
        switch (a.type) {
            case ValueType.INTGR:
            case ValueType.FLOAT:
                if (ValueUtil.ifRealNumber(b)) {
                    result.num_v = a.num_v * b.num_v
                    result.type = (a.type == b.type && a.type == ValueType.INTGR) ? ValueType.INTGR : ValueType.FLOAT
                }
                else {
                    throw "unsupport cmplex number for plus operator yet"
                }
                break;
            default:
                throw "unsupport cmplex number for plus operator yet"
        }
        e.push(result)
    },
    div: (e: EvalContext, arg: Argument) => {
        let b = e.pop()
        let a = e.pop()
        let result = new Value
        switch (a.type) {
            case ValueType.INTGR:
            case ValueType.FLOAT:
                if (ValueUtil.ifRealNumber(b)) {
                    result.num_v = a.num_v / b.num_v
                    result.type = (a.type == b.type && a.type == ValueType.INTGR) ? ValueType.INTGR : ValueType.FLOAT
                }
                else {
                    throw "unsupport cmplex number for div operator yet"
                }
                break;
            default:
                throw "unsupport cmplex number for div operator yet"
        }
        e.push(result)
    },
    mod: (e: EvalContext, arg: Argument) => {
        let b = e.pop()
        let a = e.pop()
        let result = new Value
        if (a.type == ValueType.INTGR && b.type == ValueType.INTGR) {
            result.num_v = a.num_v % b.num_v
            result.type = ValueType.INTGR
        } else {
            throw "unsupport cmplex number for plus operator yet"
        }
        e.push(result)
    },
    power: (e: EvalContext, arg: Argument) => {
        let b = e.pop()
        let a = e.pop()
        let result = new Value
        switch (a.type) {
            case ValueType.INTGR:
            case ValueType.FLOAT:
                if (ValueUtil.ifRealNumber(b)) {
                    result.num_v = Math.pow(a.num_v, b.num_v)
                    result.type = (a.type == b.type && a.type == ValueType.INTGR) ? ValueType.INTGR : ValueType.FLOAT
                }
                else {
                    throw "unsupport cmplex number for plus operator yet"
                }
                break;
            default:
                throw "unsupport cmplex number for plus operator yet"
        }
        e.push(result)
    },
    factorial: (e: EvalContext, arg: Argument) => { },
    concatenate: (e: EvalContext, arg: Argument) => { },
    eqs: (e: EvalContext, arg: Argument) => { },
    nes: (e: EvalContext, arg: Argument) => { },
    strlen: (e: EvalContext, arg: Argument) => { },
    strstrt: (e: EvalContext, arg: Argument) => { },
    range: (e: EvalContext, arg: Argument) => { },
    index: (e: EvalContext, arg: Argument) => { },
    cardinality: (e: EvalContext, arg: Argument) => { },
    words: (e: EvalContext, arg: Argument) => { },
    word: (e: EvalContext, arg: Argument) => { },
    strftime: (e: EvalContext, arg: Argument) => { },
    strptime: (e: EvalContext, arg: Argument) => { },
    time: (e: EvalContext, arg: Argument) => { },
    assign: (e: EvalContext, arg: Argument) => { },
    value: (e: EvalContext, arg: Argument) => { },
    trim: (e: EvalContext, arg: Argument) => { },
    real: (e: EvalContext, arg: Argument) => { },
    imag: (e: EvalContext, arg: Argument) => { },
    sin: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.sin(v.num_v)
        } else {
            throw `unsupport type for operator sin: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    cos: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.cos(v.num_v)
        } else {
            throw `unsupport type for operator sin: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    tan: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.tan(v.num_v)
        } else {
            throw `unsupport type for operator tan: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    asin: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.asin(v.num_v)
        } else {
            throw `unsupport type for operator asin: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    acos: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.acos(v.num_v)
        } else {
            throw `unsupport type for operator acos: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    atan: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.atan(v.num_v)
        } else {
            throw `unsupport type for operator atan: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    atan2: (e: EvalContext, arg: Argument) => {
        
    },
    sinh: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.sinh(v.num_v)
        } else {
            throw `unsupport type for operator sinh: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    cosh: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.cosh(v.num_v)
        } else {
            throw `unsupport type for operator cosh: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    tanh: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.tanh(v.num_v)
        } else {
            throw `unsupport type for operator tanh: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    asinh: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.asinh(v.num_v)
        } else {
            throw `unsupport type for operator asinh: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    acosh: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.acosh(v.num_v)
        } else {
            throw `unsupport type for operator acosh: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    atanh: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.atanh(v.num_v)
        } else {
            throw `unsupport type for operator atanh: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    ellip_first: (e: EvalContext, arg: Argument) => {},
    ellip_second: (e: EvalContext, arg: Argument) => {},
    ellip_third: (e: EvalContext, arg: Argument) => {},
    int: (e: EvalContext, arg: Argument) => {},
    abs: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.abs(v.num_v)
        } else {
            throw `unsupport type for operator abs: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    sgn: (e: EvalContext, arg: Argument) => {},
    sqrt: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.sqrt(v.num_v)
        } else {
            throw `unsupport type for operator sqrt: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    exp: (e: EvalContext, arg: Argument) => {},
    log10: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.log10(v.num_v)
        } else {
            throw `unsupport type for operator log10: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    log: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.log(v.num_v)
        } else {
            throw `unsupport type for operator log: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    floor: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.floor(v.num_v)
        } else {
            throw `unsupport type for operator floor: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    ceil: (e: EvalContext, arg: Argument) => {
        let v = e.pop()
        if (ValueUtil.ifRealNumber(v)) {
            v.num_v = Math.ceil(v.num_v)
        } else {
            throw `unsupport type for operator ceil: ${JSON.stringify(v)}`
        }
        e.push(v)
    },
    exists: (e: EvalContext, arg: Argument) => {},
    besi0: (e: EvalContext, arg: Argument) => {},
    besi1: (e: EvalContext, arg: Argument) => {},
    besj0: (e: EvalContext, arg: Argument) => {},
    besj1: (e: EvalContext, arg: Argument) => {},
    besy0: (e: EvalContext, arg: Argument) => {},
    besy1: (e: EvalContext, arg: Argument) => {},
    besjn: (e: EvalContext, arg: Argument) => {},
    besyn: (e: EvalContext, arg: Argument) => {},

}

class ValueUtil {
    static checkIfInt(value: Value) {
        if (value && value.type == ValueType.INTGR) {
            return
        }
        throw "not int value"
    }

    static ifRealNumber(value: Value) {
        return value.type == ValueType.INTGR || ValueType.FLOAT
    }
}

class EvalContext {

    dummyTable: { [key: string]: number } = {}

    dummyValues: Value[]

    stack: Value[] = new Array

    push(v: Value) {
        if (this.stack.length > 250) {
            throw "expression stack overflow"
        }
        this.stack.push(v)
    }

    pop(): Value {
        return this.stack.pop()
    }
}

export class Expression {

    actions: Action[]



    constructor(init: any) {
        init && Object.assign(this, init)
    }



    eval(dummyValues: Value[]) {



        let context = new EvalContext()

        context.dummyValues = dummyValues

        for (let i = 0; i < this.actions.length;) {
            let action = this.actions[i]
            let jump_offset = 1;
            if (action.op == Operator.JUMP) {

            } else {
                builtinTable[action.op as string](context, action.arg)
                i++
            }
            //console.info(JSON.stringify(context.stack, null, 1))
        }
        return context.stack[0]

    }

    static isBuiltin(name: string): boolean {
        return builtinTable[name] != null
    }

}



class Argument {
    constructor(init?: Argument) {
        init && Object.assign(this, init)
    }
    value: Value = new Value
    udv: UDV// = new UDV
    udf: UDF// = new UDF
}

class Action {
    constructor(init?: Action) {
        init && Object.assign(this, init)
    }
    op: Operator | Function
    arg?: Argument = new Argument
}

enum Operator {
    PUSHC = 'pushc',
    ASSIGN = 'assign',
    POP = 'pop',
    CALL_UDF = 'call_udf',
    CALL_BUILTIN = 'call_builtin',
    PUSH = 'push',
    FACTORIAL = 'factorial',
    POWER = 'power',
    BOR = 'bor',
    XOR = 'xor',
    AND = 'and',
    BAND = 'band',
    EQ = 'eq',
    NE = 'ne',
    EQS = 'eqs',
    NES = 'nes',
    GT = 'gt',
    LT = 'lt',
    GE = 'ge',
    LE = 'le',
    LEFTSHIFT = 'leftshift',
    RIGHTSHIFT = 'rightshift',
    CONCATENATE = 'concatenate',
    PLUS = 'plus',
    MINUS = 'minus',
    MULT = 'mult',
    DIV = 'div',
    MOD = 'mod',
    LNOT = 'lnot',
    BNOT = 'bnot',
    UMINUS = 'uminus',
    JUMP = 'jump',
    PUSHD1 = "pushd1",
    PUSHD2 = "pushd2",
    PUSHD = "pushd"
}



export class ExpressionParser {

    private datas: any[]

    private actions: Action[] = new Array

    private level: number = 0

    constructor(private tokenizer: Tokenizer, private udf?: UDF) {

    }

    parse(): Expression {
        this.parse_expression()
        return new Expression({
            actions: this.actions
        })
    }

    parse_expression() {
        if (this.parse_assignment_expression()) {
            return
        }

        this.level++
        this.accept_logical_OR_expression()
        this.parse_conditional_expression()
        this.level--
    }

    accept_logical_OR_expression() {
        this.accept_logical_AND_expression();
        this.parse_logical_OR_expression();
    }

    accept_logical_AND_expression() {
        this.acceptInclusiveORExpression();
        this.parse_logical_AND_expression();
    }

    acceptInclusiveORExpression() {
        this.accept_exclusive_OR_expression();
        this.parse_inclusive_OR_expression();
    }

    accept_exclusive_OR_expression() {
        this.accept_AND_expression();
        this.parse_exclusive_OR_expression();
    }

    accept_AND_expression() {
        this.accept_equality_expression();
        this.parse_AND_expression();
    }


    accept_equality_expression() {
        this.accept_relational_expression();
        this.parse_equality_expression();
    }

    accept_relational_expression() {
        this.accept_bitshift_expression();
        this.parse_relational_expression();
    }

    accept_bitshift_expression() {
        this.accept_additive_expression();
        this.parse_bitshift_expression();
    }

    accept_additive_expression() {
        this.accept_multiplicative_expression();
        this.parse_additive_expression();
    }

    accept_multiplicative_expression() {
        this.parse_unary_expression();		   /* - things */
        this.parse_multiplicative_expression(); /* * / % */
    }


    parse_assignment_expression(): boolean {
        //check for assignment operator Var = <expr>
        if (this.tokenizer.check(TokenUtil.isLetter) && this.tokenizer.checkForwardEquals(1, "=")) {

            let action = this.addAction(Operator.PUSHC);
            action.arg.value.type = ValueType.STRING
            action.arg.value.string_v = this.tokenizer.currentText()


            action = this.addAction(Operator.PUSHC);
            action.arg.value.type = ValueType.NOTDEFINDED

            this.tokenizer.forward(2)
            this.parse_expression()

            this.addAction(Operator.ASSIGN)
            return true;
        } else {
            return this.parse_array_assignment_expression();
        }
    }

    /*
    * If an array assignment is the first thing on a command line it is handled by
    * the separate routine array_assignment().
    * Here we catch assignments that are embedded in an expression.
    * Examples:
    *	print A[2] = foo
    *	A[1] = A[2] = A[3] = 0
    */
    parse_array_assignment_expression(): boolean {
        //TODO: 暂不支持 array_assignment
        if (this.tokenizer.check(TokenUtil.isLetter) && this.tokenizer.checkForwardEquals(1, '[')) {
            this.throwTokenError("unsupport yet!!")
        }
        return false;
    }

    parse_primary_expression() {

        // (expression1, expression2, ...)
        if (this.tokenizer.checkEquals('(')) {
            this.tokenizer.forward();
            this.parse_expression();
            while (this.tokenizer.checkEquals(',')) {
                this.tokenizer.forward()
                // use last expression result when eval
                this.addAction(Operator.POP)
                this.parse_expression();
            }

            if (!this.tokenizer.checkEquals(')')) {
                this.throwTokenError(") expected")
            }else{
                this.tokenizer.forward()
            }
        }
        // datablock : $xx[] 
        else if (this.tokenizer.checkEquals('$')) {
            this.throwTokenError("unsupport yet!!")
        }

        else if (this.tokenizer.checkEquals('|')) {
            this.throwTokenError("unsupport yet!!")
        } else if (this.tokenizer.check(TokenUtil.isFloat)) {
            let action = this.addAction(Operator.PUSHC)
            action.arg.value = this.tokenizer.current().value
            this.tokenizer.forward()

        } else if (this.tokenizer.check(TokenUtil.isLetter)) {

            // 函数参数个数
            let paramNum = new Value({
                type: ValueType.INTGR
            })

            let letter = this.tokenizer.currentText()

            /* Found an identifier --- check whether its a function or a
            * variable by looking for the parentheses of a function
            * argument list */
            if (this.tokenizer.checkForwardEquals(1, "(")) {
                let builtin = builtinTable[this.tokenizer.currentText()];
                if (builtin) {
                    this.tokenizer.forward(2)
                    this.parse_expression()
                    paramNum.num_v = 1

                    while (this.tokenizer.checkEquals(',')) {
                        this.tokenizer.forward(1)
                        this.parse_expression()
                        paramNum.num_v += 1
                    }

                    if (!this.tokenizer.checkEquals(')')) {
                        this.throwTokenError("')' expected")
                    }

                    this.tokenizer.forward(1)
                    this.addAction(Operator.CALL_BUILTIN).arg.value.string_v = letter
                }
                // call udf
                else {

                    this.tokenizer.forward(2)
                    this.parse_expression()
                    paramNum.num_v = 1

                    while (this.tokenizer.checkEquals(',')) {
                        this.tokenizer.forward()
                        this.parse_expression()
                        paramNum.num_v += 1
                    }


                    this.addAction(Operator.PUSHC).arg.value = paramNum
                    if (!this.tokenizer.checkEquals(')')) {
                        this.throwTokenError("')' expected")
                    }
                    this.tokenizer.forward()
                    this.addAction(Operator.CALL_UDF).arg.value.string_v = letter
                }

            }

            else if (this.tokenizer.checkEquals('sum') && this.tokenizer.checkForwardEquals(1, '[')) {
                this.parse_sum_expression();
            }


            else if (this.udf) {
                if (this.tokenizer.checkEquals(this.udf.dummies[0])) {
                    this.tokenizer.forward()
                    this.addAction(Operator.PUSHD1).arg.udf = this.udf
                } else if (this.tokenizer.checkEquals(this.udf.dummies[1])) {
                    this.tokenizer.forward()
                    this.addAction(Operator.PUSHD2).arg.udf = this.udf
                } else {
                    let param = false;
                    for (let i = 2; i < this.udf.dummies.length; i++) {
                        if (this.tokenizer.checkEquals(this.udf.dummies[i])) {
                            this.tokenizer.forward()
                            param = true;
                            this.addAction(Operator.PUSHC).arg.value = new Value({ type: ValueType.INTGR, num_v: i })
                            this.addAction(Operator.PUSHD).arg.udf = this.udf;
                        }
                    }
                    if (!param) {
                        this.addAction(Operator.PUSH).arg.udv = this.addUDV(this.tokenizer.currentText())
                        this.tokenizer.forward()
                    }
                }
            }

            else {
                this.addAction(Operator.PUSH).arg.udv = this.addUDV(this.tokenizer.currentText())
                this.tokenizer.forward()
            }


        } else if (this.tokenizer.check(TokenUtil.isString)) {
            let action = this.addAction(Operator.PUSHC)
            action.arg.value.type = ValueType.STRING
            action.arg.value.string_v = eval(this.tokenizer.currentText())
            this.tokenizer.forward()

        } else {
            this.throwTokenError("invalid expression")
        }

        while (true) {
            if (this.tokenizer.checkEquals('!')) {

                this.addAction(Operator.FACTORIAL)
                this.tokenizer.forward()

            } else if (this.tokenizer.checkEquals('**')) {
                this.tokenizer.forward()
                this.parse_unary_expression();
                this.addAction(Operator.POWER)
            }

            /* Parse and add actions for range specifier applying to previous entity.
            * Currently the [beg:end] form is used to generate substrings, but could
            * also be used to extract vector slices.  The [i] form is used to index
            * arrays, but could also be a shorthand for extracting a single-character
            * substring.
            */
            else if (this.tokenizer.checkEquals('[') && !this.tokenizer.checkForward(-1, TokenUtil.isFloat)) {
                this.throwTokenError("unsupport yet!!")
            } else {
                break;
            }
        }
    }

    parse_conditional_expression() {
        if (this.tokenizer.checkEquals("?")) {
            this.throwTokenError("unsupport yet!!")
        }
    }

    parse_logical_OR_expression() {
        while (this.tokenizer.checkEquals("||")) {
            this.throwTokenError("unsupport yet!!")
        }
    }

    parse_logical_AND_expression() {
        while (this.tokenizer.checkEquals("&&")) {
            this.throwTokenError("unsupport yet!!")
        }

    }

    parse_sum_expression() {
        this.throwTokenError("invalid expression")
    }

    parse_inclusive_OR_expression() {
        while (this.tokenizer.checkEquals('|')) {
            this.tokenizer.forward()
            this.accept_exclusive_OR_expression()
            this.addAction(Operator.BOR)
        }
    }

    parse_exclusive_OR_expression() {
        while (this.tokenizer.checkEquals('^')) {
            this.tokenizer.forward()
            this.accept_exclusive_OR_expression()
            this.addAction(Operator.XOR)
        }
    }

    parse_AND_expression() {
        while (this.tokenizer.checkEquals('&')) {
            this.tokenizer.forward()
            this.accept_exclusive_OR_expression()
            this.addAction(Operator.BAND)
        }
    }

    parse_equality_expression() {
        while (true) {
            if (this.tokenizer.checkEquals('==')) {
                this.tokenizer.forward()
                this.accept_relational_expression()
                this.addAction(Operator.EQ)
            }

            else if (this.tokenizer.checkEquals('!=')) {
                this.tokenizer.forward()
                this.accept_relational_expression()
                this.addAction(Operator.NE)
            }

            else if (this.tokenizer.checkEquals('eq')) {
                this.tokenizer.forward()
                this.accept_relational_expression()
                this.addAction(Operator.EQS)
            }

            else if (this.tokenizer.checkEquals('ne')) {
                this.tokenizer.forward()
                this.accept_relational_expression()
                this.addAction(Operator.NES)
            }
            else {
                break;
            }
        }
    }

    parse_relational_expression() {
        while (true) {
            if (this.tokenizer.checkEquals('>')) {
                this.tokenizer.forward()
                this.accept_bitshift_expression()
                this.addAction(Operator.GT)
            } else if (this.tokenizer.checkEquals('<')) {
                // TODO    Workaround for * in syntax of range constraints
                //if (scanning_range_in_progress && equals(c_token + 1, "*")) {
                //     break;
                // }
                this.tokenizer.forward()
                this.accept_bitshift_expression()
                this.addAction(Operator.LT)
            } else if (this.tokenizer.checkEquals('>=')) {
                this.tokenizer.forward()
                this.accept_bitshift_expression()
                this.addAction(Operator.GE)
            }
            else if (this.tokenizer.checkEquals('<=')) {
                this.tokenizer.forward()
                this.accept_bitshift_expression()
                this.addAction(Operator.LE)
            } else {
                break;
            }
        }
    }


    parse_bitshift_expression() {
        while (true) {
            if (this.tokenizer.checkEquals('<<')) {
                this.tokenizer.forward()
                this.accept_additive_expression()
                this.addAction(Operator.LEFTSHIFT)
            }

            else if (this.tokenizer.checkEquals('>>')) {
                this.tokenizer.forward()
                this.accept_additive_expression()
                this.addAction(Operator.RIGHTSHIFT)
            } else {
                break;
            }
        }
    }

    parse_additive_expression() {
        while (true) {
            if (this.tokenizer.checkEquals('.')) {
                this.tokenizer.forward()
                this.accept_multiplicative_expression()
                this.addAction(Operator.CONCATENATE)
            }

            // TODO 
            // else if (string_result_only && parse_recursion_level == 1) {
            //     break;
            // }

            else if (this.tokenizer.checkEquals('+')) {
                this.tokenizer.forward()
                this.accept_multiplicative_expression()
                this.addAction(Operator.PLUS)
            }

            else if (this.tokenizer.checkEquals('-')) {
                this.tokenizer.forward()
                this.accept_multiplicative_expression()
                this.addAction(Operator.MINUS)
            }

            else {
                break;
            }

        }
    }

    parse_multiplicative_expression() {
        while (true) {
            if (this.tokenizer.checkEquals('*')) {
                this.tokenizer.forward()
                this.parse_unary_expression()
                this.addAction(Operator.MULT)
            }

            else if (this.tokenizer.checkEquals('/')) {
                this.tokenizer.forward()
                this.parse_unary_expression()
                this.addAction(Operator.DIV)
            }

            else if (this.tokenizer.checkEquals('%')) {
                this.tokenizer.forward()
                this.parse_unary_expression()
                this.addAction(Operator.MOD)
            } else {
                break;
            }
        }
    }

    parse_unary_expression() {
        if (this.tokenizer.checkEquals('!')) {
            this.tokenizer.forward()
            this.parse_unary_expression()
            this.addAction(Operator.LNOT)
        } else if (this.tokenizer.checkEquals('~')) {
            this.tokenizer.forward()
            this.parse_unary_expression()
            this.addAction(Operator.BNOT)
        } else if (this.tokenizer.checkEquals('-')) {
            this.tokenizer.forward()
            this.parse_unary_expression()
            let pre = this.actions[this.actions.length - 1]
            if (pre.op == Operator.PUSHC && pre.arg.value.type == ValueType.INTGR) {
                pre.arg.value.num_v = -pre.arg.value.num_v
            } else if (pre.op == Operator.PUSHC && pre.arg.value.type == ValueType.FLOAT) {
                pre.arg.value.num_v = -pre.arg.value.num_v
            } else if (pre.op == Operator.PUSHC && pre.arg.value.type == ValueType.CMPLX) {
                pre.arg.value.complex_v.real = -pre.arg.value.complex_v.real
                pre.arg.value.complex_v.imaginary = -pre.arg.value.complex_v.imaginary
            } else {
                this.addAction(Operator.UMINUS)
            }
        } else if (this.tokenizer.checkEquals('+')) {
            this.tokenizer.forward()
            this.parse_unary_expression()

        } else {
            this.parse_primary_expression()
        }
    }

    addAction(op: Operator | Function): Action {
        let action = new Action({
            op: op
        })
        this.actions.push(action)
        return action
    }

    addUDV(name: string): UDV {
        let udv = PlotContext.get().udvTable.get(name)
        if (!udv) {
            udv = new UDV({
                name: name,
                value: new Value({
                    type: ValueType.NOTDEFINDED
                })
            })
            PlotContext.get().udvTable.set(name, udv)
        }
        return udv
    }

    throwTokenError(message: string, token?: Token): ParseError {
        throw ParseError.byToken(PlotContext.get().currentCmd, token ? token : this.tokenizer.current() || this.tokenizer.last(), message)
    }
}



