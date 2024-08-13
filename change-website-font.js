// ==UserScript==
// @name         change-website-font
// @namespace    http://tampermonkey.net/
// @description  Changes the font of webpages to desired font
// @version      1.1.1
// @author       vioo-bkp
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // change FONT_NAME to your preferable font to use
    // make sure you have the specific font installed on your OS

    // configuration
    const PREFERRED_FONT = 'MiSans Latin';
    const EXCLUDED_SELECTORS = [
        'pre',
        'code',
        '.code',
        '[class*="code-"]', 
        '[class*="material-symbols-outlined"]',
        '[class*="material-icons"]', // common class for Google Material Icons
        '[class*="icon-"]',
    ];

    // function to apply font to an element and its children
    function applyFontToElement(element) {
        if (EXCLUDED_SELECTORS.some(selector => element.matches(selector))) {
            return; // Skip excluded elements
        }

        element.style.setProperty('font-family', `${PREFERRED_FONT}`, 'important');

        for (let child of element.children) {
            applyFontToElement(child);
        }
    }

    // Apply font change
    applyFontToElement(document.body);

    // Handle dynamically added content
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            for (let node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    applyFontToElement(node);
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Log script activation
    // console.log('Font change script activated');

})();
