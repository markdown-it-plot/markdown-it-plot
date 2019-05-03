import { Terminal } from "./teriminal";
import { Painter, SVGPainter } from "../painter/painter";
import { PlotContext } from "../plot-context";
// import { JSDOM } from 'jsdom'

export class SVGTerminal implements Terminal {
    createPainter(options: any): Painter {
        let context = PlotContext.get()
        context.terminalOptions = context.terminalOptions || {}
        
        let container = context.terminalOptions.container;

        if (!container) {
            // container = context.terminalOptions.container = SVGTerminal.createDefaultContainer()
            throw new Error(`no container`)
        } else if (typeof container == 'string') {
            container = window.document.querySelector(container)
        }
        if (container instanceof HTMLElement) {
            return new SVGPainter(container)
        } else {
            throw new Error(`unknow terminal - ${context.terminalOptions.container}`)
        }
    }

}