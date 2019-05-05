import { Command } from "./command";
import { Tokenizer } from "../tokenizer";
import { PlotContext } from "../plot-context";
import { ParseError } from "../parse-error";
import { ArrowParse } from "../objects/arrow";

export class SetCommand implements Command {

    constructor(private tokenizer: Tokenizer) { }
    names(): string[] {
        throw new Error("Method not implemented.");
    }
    help(): string {
        throw new Error("Method not implemented.");
    }
    execute(): void {
        if (this.tokenizer.checkEquals('arrow')) {
            this.tokenizer.forward()

            let arrow = ArrowParse.parse(this.tokenizer)
            PlotContext.get().objects.arrow.push(arrow)

        } else if (this.tokenizer.checkEquals('object')) {
            this.tokenizer.forward()
            throw ParseError.byToken(this.tokenizer.getOrigin(), this.tokenizer.current(), "will support soon!!")
        }


    }
}