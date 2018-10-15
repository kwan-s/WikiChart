"use strict";
// This script defines an object that has some common cross-browser functions.

(function(window) {
  // global functions
  window.U = {

    /**
     * Get an element by id
     *
     * @param  {string} id
     * @returns {Element}
     */
    $: function(id) {
      if (typeof id !== "string") {
        throw new TypeError(errorMsg("Invalid parameters for U.$", arguments));
      }
      return document.getElementById(id);
    },

    /**
     * Set node text (textContent)
     *
     * @param  {Element} el
     * @param  {?} message
     */
    setText: function(el, message) {
      if (!(el instanceof Element)) {
        throw new TypeError(errorMsg("Invalid parameters for U.setText", arguments));
      }
      if (el.textContent !== undefined) {
        el.textContent = message;
      } else {
        el.innerText = message;
      }
    },

    /**
     * Register an event handler
     *
     * @param  {EventTarget} obj  event target
     * @param  {string} type event name, e.g. click
     * @param  {function} fn   event handler
     */
    addHandler: function(obj, type, fn) {
      if (typeof obj !== "object" || typeof type !== "string" || typeof fn !== "function") {
        throw new TypeError(errorMsg("Invalid parameters for U.addHandler", arguments));
      }
      // W3C
      if (obj && obj.addEventListener) {
        obj.addEventListener(type, fn, false);
      } else if (obj && obj.attachEvent) {
        // Older IE
        obj.attachEvent("on" + type, fn);
      } else {
        throw new Error("Failed to add handler. Is `obj` of the correct type?");
      }
    },

    /**
     * Deregister an event handler
     *
     * @param  {EventTarget} obj  event target
     * @param  {string} type event name, e.g. click
     * @param  {function} fn   event handler
     */
    removeHandler: function(obj, type, fn) {
      if (typeof obj !== "object" || typeof type !== "string" || typeof fn !== "function") {
        throw new TypeError(errorMsg("Invalid parameters for U.removeHandler", arguments));
      }
      if (obj && obj.removeEventListener) {
        // W3C
        obj.removeEventListener(type, fn, false);
      } else if (obj && obj.detachEvent) {
        // Older IE
        obj.detachEvent("on" + type, fn);
      } else {
        throw new Error("Failed to add handler. Is `obj` of the correct type?");
      }
    },

    /**
     * Get computed value of CSS property `styleName` for Element `el`
     *
     * @param  {Element} el
     * @param  {string} styleName
     * @returns {string} value of CSS property `styleName`
     */
    getStyle: function(el, styleName) {
      if (!(el instanceof Element) || typeof styleName !== "string") {
        throw new TypeError(errorMsg("Invalid parameters for U.getStyle", arguments));
      }
      if (window.getComputedStyle) {
        return document.defaultView.getComputedStyle(el, null).getPropertyValue(styleName);
      } else if (el.currentStyle) {
        return el.currentStyle[styleName];
      }
    },

    /**
     * @param  {string} type of input element, e.g. range
     * @returns {boolean} true if input `type` is supported
     */
    supportsInput: function(type) {
      var input = document.createElement("input");
      input.setAttribute("type", type);
      return input.type === type;
    },


    /**
     * Determine printable character in keypress event. Assumes
     * Probably only works with characters in basic multilingual plane.
     *
     * @param  {KeyboardEvent} e keypress event
     * @returns {string} printable character that was pressed, or undefined if not printable
     */
    getCharacter: function(e) {
      var char;
      if (e.key) {
        // shiny new way
        if (e.key.length === 1) {
          // if the user pressed a non-printable key like left arrow
          // e.key will be 'ArrowLeft', so we're only interested in length 1
          char = e.key;
        }
      } else {
        // old IE does not support `which`
        var code = typeof e.which === "number" ? e.which : e.keyCode;
        if (code !== 0) {
          // with a non-printable key like left arrow, e.which is 0.
          char = String.fromCharCode(code);
        }
        // in case of a non-printable key, char is left undefined
      }
      return char;
    },

    /**
     * Call `fn` after document.DOMContentLoaded if available, or window.load
     *
     * Simplified version of https://github.com/jfriend00/docReady/blob/master/docready.js
     *
     * @param {function} fn
     */
    ready: function(fn) {
      if (typeof fn !== "function") {
        throw new TypeError(errorMsg("Invalid parameters for U.ready", arguments));
      }
      if (readyWrapperCalled) {
        // call the function asynchronously right away
        setTimeout(fn, 1);
        return;
      } else {
        // schedule it to fire when DOM is ready
        readyList.push(fn);
      }
      // if document already ready to go, schedule the ready function to run
      if (document.readyState === "complete") {
        setTimeout(readyWrapper, 1);
      } else if (!readyEventHandlersSet) {
        // DOMContentLoaded is preferred, but if that is not available use load event
        // readyWrapper is built to be called only once, either way
        U.addHandler(document, "DOMContentLoaded", readyWrapper);
        U.addHandler(window, "load", readyWrapper);
        readyEventHandlersSet = true;
      }
    }
  };
  // local helpers
  function errorMsg(prefix, args) {
    // convert arts to an Array
    args = Array.prototype.slice.call(args);
    return prefix + ": " + args.join(",");
  }

  var readyWrapperCalled = false;
  var readyEventHandlersSet = false;
  var readyList = [];

  function readyWrapper() {
    if (readyWrapperCalled) {
      // prevent this function from being called more than once
      return;
    }
    readyWrapperCalled = true;
    for (var i = 0; i < readyList.length; i++) {
      readyList[i]();
    }
    readyList = [];
  }
})(window);
