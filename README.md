# Folding

Folding is a way to display your rendered [FoldingText](http://www.foldingtext.com) content on the web. See a [live demo here](http://hugowetterberg.github.io/folding).

I've implemented what was the most important features for me: folding, tag filtering and todo lists. Feel free to fork & send pull requests if you want additional features.

## Usage

Include "folding.js" and "folding.css". Folding.js exports one function `foldIt`. To use it you can either pass it a node list `foldIt(document.getElementsByClassName('post-content'))`, a single element `foldIt(document.getElementById('fold-this'))` or simply call `foldIt()` to have it process all elements with the class "folding".

    // Process all elements with the class "folding".
    foldIt();

    // Process a single element
    foldIt(document.getElementById('fold-this'));

    // Process all elements in a node list.
    foldIt(document.getElementsByClassName('post-content'));
