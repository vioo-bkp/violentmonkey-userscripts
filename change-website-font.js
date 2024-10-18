// ==UserScript==
// @name         Advanced Website Font Changer
// @namespace    Violentmonkey Scripts
// @description  Changes the font of webpages to desired font while preserving icons and layout
// @version      2.0.0
// @author       vioo-bkp (improved by Claude)
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    let PREFERRED_FONT = GM_getValue('preferredFont', 'Arial, sans-serif');
    let MIN_FONT_SIZE = GM_getValue('minFontSize', 12);
    let EXCLUDED_SELECTORS = [
        'pre',
        'code',
        '.code',
        '[class*="code-"]',
        '[class*="material-symbols-outlined"]',
        '[class*="material-icons"]',
        '[class*="icon-"]',
        'i[class*="fa-"]',
        'span[class*="glyphicon"]',
        '[class*="icomoon"]',
        '[data-icon]',
        'svg',
        'canvas'
    ];

    const ICON_FONT_REGEX = /(icon|awesome|glyph|fontello|icomoon|symbol)/i;

    // Font size mapping for relative sizes
    const FONT_SIZE_MAP = {
        'xx-small': '8px',
        'x-small': '10px',
        'small': '12px',
        'medium': '16px',
        'large': '18px',
        'x-large': '24px',
        'xx-large': '32px'
    };

    function shouldExclude(element) {
        return EXCLUDED_SELECTORS.some(selector => element.matches(selector));
    }

    function convertToPixels(size) {
        if (FONT_SIZE_MAP[size]) return parseFloat(FONT_SIZE_MAP[size]);
        return parseFloat(size);
    }

    function applyFontToElement(element) {
        if (shouldExclude(element)) return;

        const computedStyle = window.getComputedStyle(element);
        const currentFontFamily = computedStyle.getPropertyValue('font-family');

        if (!ICON_FONT_REGEX.test(currentFontFamily)) {
            // Apply preferred font
            element.style.setProperty('font-family', `${PREFERRED_FONT}, ${currentFontFamily}`, 'important');

            // Handle font weight
            const fontWeight = computedStyle.getPropertyValue('font-weight');
            element.style.setProperty('font-weight', fontWeight, 'important');

            // Handle font size
            let fontSize = computedStyle.getPropertyValue('font-size');
            fontSize = convertToPixels(fontSize);
            if (fontSize < MIN_FONT_SIZE) {
                fontSize = MIN_FONT_SIZE;
            }
            element.style.setProperty('font-size', `${fontSize}px`, 'important');

            // Preserve line height ratio
            const lineHeight = computedStyle.getPropertyValue('line-height');
            if (lineHeight !== 'normal') {
                const lineHeightNum = parseFloat(lineHeight);
                const lineHeightUnit = lineHeight.replace(lineHeightNum, '');
                if (lineHeightUnit === '') {
                    // unitless line height, preserve ratio
                    element.style.setProperty('line-height', lineHeightNum, 'important');
                } else {
                    // line height with units, convert to pixels if needed
                    const lineHeightPx = convertToPixels(lineHeight);
                    element.style.setProperty('line-height', `${lineHeightPx}px`, 'important');
                }
            }

            // Apply font smoothing
            element.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
            element.style.setProperty('-moz-osx-font-smoothing', 'grayscale', 'important');

            // Set consistent font features
            element.style.setProperty('font-feature-settings', '"kern" 1, "liga" 1, "calt" 1', 'important');
        }

        // Recursively apply to children
        for (let child of element.children) {
            applyFontToElement(child);
        }
    }

    // Apply font change
    function applyFontChange() {
        applyFontToElement(document.body);
    }

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

    // Observe changes in the DOM
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial application
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyFontChange);
    } else {
        applyFontChange();
    }

    // Add menu commands for user configuration
    GM_registerMenuCommand('Set Preferred Font', () => {
        const newFont = prompt('Enter preferred font (e.g., "Arial, sans-serif"):', PREFERRED_FONT);
        if (newFont) {
            PREFERRED_FONT = newFont;
            GM_setValue('preferredFont', newFont);
            applyFontChange();
        }
    });

    GM_registerMenuCommand('Set Minimum Font Size', () => {
        const newSize = prompt('Enter minimum font size in pixels:', MIN_FONT_SIZE);
        if (newSize && !isNaN(newSize)) {
            MIN_FONT_SIZE = parseInt(newSize, 10);
            GM_setValue('minFontSize', MIN_FONT_SIZE);
            applyFontChange();
        }
    });
})();
