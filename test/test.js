var plot = require('..')
var MarkdownIt = require('markdown-it')



let html = new MarkdownIt().use(plot).render(" \n\
```plot \n\
plot sin(x) \n\
```\n")

console.info(html)