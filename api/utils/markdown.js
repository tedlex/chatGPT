//const hljs = require('highlight.js');
const hljs = require('highlight.js/lib/common');
var md = require('markdown-it')({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            //console.log(`exist lang: ${lang}`)
            try {
                return '<pre class="hljs"><code class="hljs">' +
                    hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                    '</code></pre>';
            } catch (__) { }
        } else {
            try {
                let h = hljs.highlightAuto(str)
                return '<pre class="hljs"><code class="hljs">' + h.value + '</code></pre>';
            } catch (_) { }
        }
        //console.log('Auto fail')
        return '<pre class="hljs"><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

module.exports = md;