import { Command } from './command'
import { PlotCommand } from './plot-command';
import { SetCommand } from './set-command';
import { Tokenizer } from '../tokenizer';
import { PlotContext } from '../plot-context';
import { ParseError } from '../parse-error';



export class Commands {
    static commands: { [key: string]: { new(tokenizer:Tokenizer): Command } } = {
        'set': SetCommand,
        'plot': PlotCommand
    }

    static createCommand(tokenizer:Tokenizer): Command  {
        tokenizer.reset()
        let first = tokenizer.current()
        let ctor = this.commands[first.text]
        if(ctor){
            tokenizer.forward()
            return new ctor(tokenizer)
        }else{
            throw ParseError.byToken(tokenizer.getOrigin(), first, `no such command -  ${first.text}`)
        }
    }
}

interface CommandConstructor<T>{
    new(tokenizer:Tokenizer, context: PlotContext):T
}