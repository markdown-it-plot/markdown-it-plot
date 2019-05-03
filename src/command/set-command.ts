import { Command } from "./command";
import { Tokenizer } from "../tokenizer";
import { PlotContext } from "../plot-context";

export class SetCommand implements Command {
    names(): string[] {
        throw new Error("Method not implemented.");
    }
    help(): string {
        throw new Error("Method not implemented.");
    }
    execute(tokenizer: Tokenizer, context:PlotContext): void {
        throw new Error("Method not implemented.");
    }
}