// ==UserScript==
// @name         change-website-font
// @namespace    http://tampermonkey.net/
// @description  Changes the font of webpages to desired font while preserving icons
// @version      1.2.0
// @author       vioo-bkp
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const PREFERRED_FONT = 'MiSans Latin, sans-serif';
    const EXCLUDED_SELECTORS = [
        'pre',
        'code',
        '.code',
        '[class*="code-"]',
        '[class*="material-symbols-outlined"]',
        '[class*="material-icons"]',
        '[class*="icon-"]',
        'i[class*="fa-"]', // Font Awesome icons
        'span[class*="glyphicon"]', // Bootstrap glyphicons
        '[class*="icomoon"]', // IcoMoon icons
        '[data-icon]', // General attribute for icons
    ];

    function shouldExclude(element) {
        return EXCLUDED_SELECTORS.some(selector => element.matches(selector));
    }

    function applyFontToElement(element) {
        if (shouldExclude(element)) return;

        const computedStyle = window.getComputedStyle(element);
        const currentFontFamily = computedStyle.getPropertyValue('font-family');

        // Check if the current font is likely an icon font
        if (!currentFontFamily.includes('icon') && !currentFontFamily.includes('awesome')) {
            element.style.setProperty('font-family', `${PREFERRED_FONT}, ${currentFontFamily}`, 'important');
        }

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

    console.log('Improved Font Changer script activated');
})();