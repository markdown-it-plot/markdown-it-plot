import * as MarkdownIt from "markdown-it"
import { PlotContext } from "./plot-context";
import { Tokenizer } from "./tokenizer";
import { Commands } from "./command/commands";
import * as d3 from "d3"
import { ParseError } from "./parse-error";

function getLangName(info: string): string {
    return info.split(/\s+/g)[0];
}

function createContainer() {
    return document.createElement('div')
}

function render(content: string) {
    let context = PlotContext.reset()

    context.terminalOptions = context.terminalOptions || {}
    context.terminalOptions.container = createContainer()

    try {
        let lines = (content as string).split(/\r?\n/g)
            .map(l => l.trim()).filter(l => l)
            .forEach(l => {
                context.currentCmd = l
                let tokenizer = new Tokenizer(l)
                let cmd = Commands.createCommand(tokenizer)
                cmd.execute()
            })
    } catch (e) {
        let container = d3.select(context.terminalOptions.container).html("")
        let box = container.append('div').attr("width", 600).attr("height", 400).attr("style", "backgroud-color:#f2dede; border:#eed3d7 solid 1px; color:#b94a48")
        if (typeof (e) == "string") {
            box.append("绘图失败：" + e)
        } else if (e instanceof ParseError) {
            box.append('pre').text(e.render())
        } else {
            box.append('pre').text(JSON.stringify(e))
        }

    }

    return context.terminalOptions.container.innerHTML
}

let plugin: any = function plot_plugin(md: MarkdownIt, options: any) {

    let defaultFenceRenderer = md.renderer.rules.fence;

    function plotRenderer(tokens: any[], idx: number, options: any, env: any, slf: any) {

        let token = tokens[idx];
        let info = token.info.trim();
        let lang = info ? getLangName(info) : "";

        if (lang == 'plot') {
            return render(token.content)
        } else {
            return defaultFenceRenderer(tokens, idx, options, env, slf);
        }
    }


    md.renderer.rules.fence = plotRenderer;
}

plugin.render = render

export = plugin

