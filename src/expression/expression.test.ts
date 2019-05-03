import { Tokenizer, UDF, Value, ValueType } from '../tokenizer'
import { ExpressionParser } from './expression'

let text = '1 + sin(x) / 2 * 3'
let exp = new ExpressionParser(new Tokenizer(text)).parse()
//console.info(JSON.stringify(exp, null, 2))
//console.info("=================")

exp = new ExpressionParser(new Tokenizer('1+1')).parse()
console.info(exp.eval([]))
console.info("=================")


exp = new ExpressionParser(new Tokenizer('sin(1)+1/2')).parse()
console.info(exp.eval([]))

console.info("=================")
exp = new ExpressionParser(new Tokenizer('sin(x)+1/2'), new UDF({ dummies: ['x'], name: "" })).parse()
////console.info(JSON.stringify(exp.actions, null, 2))
for (let i = 0; i < 10; i++) {
    console.info(exp.eval([new Value({ type: ValueType.INTGR, num_v: i })]))
}
