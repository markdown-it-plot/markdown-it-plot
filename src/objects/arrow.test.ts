import { Tokenizer, UDF, Value, ValueType } from '../tokenizer'
import { ArrowParse } from './arrow';

let text = 'from 1,1 to 2,2'
let exp =  ArrowParse.parse(new Tokenizer(text))
console.info(exp)