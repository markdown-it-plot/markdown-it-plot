import { SVGTerminal } from "./svg-teriminal";
import { Terminal } from "./teriminal";
import { PlotContext } from "../plot-context";

export class TerminalFactory {

    static terminals: { [key: string]: { new(): Terminal } } = {
        svg: SVGTerminal
    }

    static createTerminal() {
        let context = PlotContext.get()
        return new this.terminals[context.terminal]
    }
}