// import { Tokenizer } from './tokenizer'
// import { Commands } from './command/commands';
// import { PlotContext } from './plot-context';
// import { JSDOM } from 'jsdom'
// import { ParseError } from './parse-error';

// if(!(global as any).HTMLElement){
//     (global as any).HTMLElement = new JSDOM().window.HTMLElement
// }

// try {


//     let context = PlotContext.reset()

//     let isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
//     console.info(isNode)
//     if(isNode){
//         let dom = new JSDOM
//         context.terminalOptions = context.terminalOptions || {}
//         context.terminalOptions.container = dom.window.document.body
//     }else{
//         context.terminalOptions.container = document.createElement('div')
//     }
    

//     let lines = process.argv[2].split(/\r?\n/g)
//         .map(l => l.trim())
//         .forEach(l => {
//             let tokenizer = new Tokenizer(l)
//             let cmd = Commands.createCommand(tokenizer, context)
//             cmd.execute(tokenizer, context)
//         })
//         console.info(`<?xml version="1.0" encoding="utf-8"  standalone="no"?>`)
//     console.info(context.terminalOptions.container.innerHTML)
// } catch (e) {
//     if(e instanceof ParseError){
//         let mark = "";
//         e.length = e.length || 1
//         for (let i = 0; i < Math.max(e.text.length, e.start) + 1; i++) {
//             if (i >= e.start && i < e.start + e.length) {
//                 mark = mark + '^'
//             } else {
//                 mark = mark + ' '
//             }
//         }
//         console.error(`${e.message}\n\t${e.text}\n\t${mark}`)
//     }else{
//         console.error(e)
//     }
    
// }
