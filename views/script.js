$(function () {
    $('blockquote').addClass('blockquote');
    $('pre code.highlight-mermaid').each(function(){
        const $code = $(this);
        $code.parent().replaceWith(function() {
            return $('<div></div>', { html: $code.html() }).addClass('mermaid');
        });
    })
    mermaid.initialize({startOnLoad:true})
});