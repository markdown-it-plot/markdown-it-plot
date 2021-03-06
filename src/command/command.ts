import { Tokenizer } from "../tokenizer";
import { PlotContext } from "../plot-context";

export interface Command {
    names(): string[]
    help(): string
    execute():void
}