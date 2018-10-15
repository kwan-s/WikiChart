"use strict";

(function() {
  /** Teaches IE < 9 to recognize HTML5 elements. */
  function createDummyElements() {
    var semanticElements = [
      "article", "aside", "details", "figcaption", "figure",
      "footer", "header", "hgroup", "menu", "nav", "section"
    ];
    for (var i = 0; i < semanticElements.length; i++) {
      document.createElement(semanticElements[i]);
    }
  }

  if (!document.addEventListener) {
    createDummyElements();
  }
})();
