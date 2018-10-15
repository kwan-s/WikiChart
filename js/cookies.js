"use strict";
// This script defines an object with common cookie operations.
// The basic implementation here is meant to illustrate how cookies work.
// See also https://github.com/madmurphy/cookies.js for a good cookie library (GPL license)


// Create one global object:
/* eslint-disable no-unused-vars */
var COOKIE = {
    /* eslint-enable no-unused-vars */

    /**
     * @param  {string} name   cookie name
     * @param  {string} value  cookie value
     * @param  {Date} expire expiration date
     */
    setCookie: function (name, value, expire) {
        // escape confusing characters
        var str = encodeURIComponent(name) + "=" + encodeURIComponent(value);
        // Add the expiration:
        str += ";expires=" + expire.toGMTString();
        // Add the cookie:
        document.cookie = str;
    },

    /**
     * @param  {string} name cookie name
     * @returns {string} cookie value
     */
    getCookie: function (name) {
        // Useful to know how long the cookie name is:
        var len = name.length;
        // Split the cookie string into a list of name=value
        var cookies = document.cookie.split(";");
        // Loop through the name=value pairs:
        for (var i = 0, count = cookies.length; i < count; i++) {
            // remove an initial space, if any:
            var pair = cookies[i].slice(0, 1) === " " ? cookies[i].slice(1) : cookies[i];
            // Decode the data:
            pair = decodeURIComponent(pair);
            // Check if the name in this pair matches the name we want:
            if (pair.slice(0, len) === name) {
                // Return the part after the equals sign:
                return pair.split("=")[1];
            }
        }
        // Return false if nothing's been returned yet:
        return false;
    },

    /**
     * @param  {type} name cookie name
     */
    deleteCookie: function (name) {
        document.cookie = encodeURIComponent(name) + "=;expires=Thu, 01-Jan-1970 00:00:01 GMT";
    }
};
