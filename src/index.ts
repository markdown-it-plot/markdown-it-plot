// import * as MarkdownIt from "markdown-it"
// import { PlotContext } from "./plot-context";
// import { JSDOM } from "jsdom";
// import { Tokenizer } from "./tokenizer";
// import { Commands } from "./command/commands";
// import * as d3 from "d3"

// function getLangName(info: string): string {
//     return info.split(/\s+/g)[0];
// }

// let isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';


// if (isNode && !(global as any).HTMLElement) {
//     (global as any).HTMLElement = new JSDOM().window.HTMLElement
// }


// function createContainer() {
//     if (isNode) {
//         let dom = new JSDOM
//         return dom.window.document.body
//     } else {
//         return document.createElement('div')
//     }
// }

// export = function plot_plugin(md: MarkdownIt, options: any) {

//     let defaultFenceRenderer = md.renderer.rules.fence;

//     function plotRenderer(tokens: any[], idx: number, options: any, env: any, slf: any) {

//         let token = tokens[idx];
//         let info = token.info.trim();
//         let lang = info ? getLangName(info) : "";

//         if (lang == 'plot') {

//             let context = PlotContext.reset()

//             context.terminalOptions = context.terminalOptions || {}
//             context.terminalOptions.container = createContainer()

//             try {
//                 let lines = (token.content as string).split(/\r?\n/g)
//                     .map(l => l.trim()).filter(l => l)
//                     .forEach(l => {
//                         let tokenizer = new Tokenizer(l)
//                         let cmd = Commands.createCommand(tokenizer, context)
//                         cmd.execute(tokenizer, context)
//                     })
//             } catch (e) {
//                 let $svg = d3.select(context.terminalOptions.container)
//                     .append('svg').attr('xmlns', 'http://www.w3.org/2000/svg').attr("width", 600).attr("height", 400).attr("fill", "#f2dede").attr("stroke", "#eed3d7")
//                 $svg.append("g").attr("x", 50).attr("y", 50).attr("width", 500).attr("height", 300)
//                     .append('text').text("绘图失败").style("color:#b94a48")

//             }

//             return context.terminalOptions.container.innerHTML

//         } else {
//             return defaultFenceRenderer(tokens, idx, options, env, slf);
//         }
//     }


//     md.renderer.rules.fence = plotRenderer;
// }

