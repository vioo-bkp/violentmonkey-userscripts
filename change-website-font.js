// ==UserScript==
// @name         change-website-font
// @namespace    http://tampermonkey.net/
// @description  Changes the font of webpages to desired font
// @version      1.0
// @author       vioo-bkp
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // change FONT_NAME to your preferable font to use
    const FONT_NAME = 'MiSans Latin';
    document.body.style.fontFamily = FONT_NAME;

})();
