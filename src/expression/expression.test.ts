import { Tokenizer, UDF, Value, ValueType, Token } from '../tokenizer'
import { ExpressionParser } from './expression'

// let text = '1 + sin(x) / 2 * 3'
// let exp = new ExpressionParser(new Tokenizer(text)).parse()
// //console.info(JSON.stringify(exp, null, 2))
// //console.info("=================")

// exp = new ExpressionParser(new Tokenizer('1+1')).parse()
// console.info(exp.eval([]))
// console.info("=================")


// exp = new ExpressionParser(new Tokenizer('sin(1)+1/2')).parse()
// console.info(exp.eval([]))

// console.info("=================")
// exp = new ExpressionParser(new Tokenizer('sin(x)+1/2'), new UDF({ dummies: ['x'], name: "" })).parse()
// ////console.info(JSON.stringify(exp.actions, null, 2))
// for (let i = 0; i < 10; i++) {
//     console.info(exp.eval([new Value({ type: ValueType.INTGR, num_v: i })]))
// }


// console.info("=================")
// let exp = new ExpressionParser(new Tokenizer('log(x) + sin(x)'), new UDF({ dummies: ['x'], name: "" })).parse()
// ////console.info(JSON.stringify(exp.actions, null, 2))
// for (let i = 2; i < 10; i+=0.1) {
//     console.info(i , exp.eval([new Value({ type: ValueType.INTGR, num_v: i })]))
// }


// let exp = new ExpressionParser(new Tokenizer('log(x) + sin(x)'), new UDF({ dummies: ['x'], name: "" })).parse()
// console.info(exp)

// console.info(exp.eval([new Value({ type: ValueType.INTGR, num_v: 10 })]))

console.info(new Tokenizer("log10(x)").tokens)