// ==UserScript==
// @name         dynamic-html5-video-control
// @namespace    Violentmonkey Scripts
// @description  Video control for HTML5 videos on all websites.
// @version      1.9.0
// @author       vioo-bkp
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const MIN_SPEED_RATE = 0,
        MAX_SPEED_RATE = 5,
        SPEED_RATE_STEP = 0.05,
        MIN_SATURATION = 0,
        MAX_SATURATION = 3,
        SATURATION_STEP = 0.1;

    let dynamicAcceleration = {
        enable: false,
        startingSpeed: 1,
        finalSpeed: 3,
        percentage: 0.6,
        startTime: 0,
    };

    let videoSpeed = 1;
    let videoSaturation = 1;
    let displayTimeout;

    // Create and style the display container
    const displayContainer = document.createElement('div');
    Object.assign(displayContainer.style, {
        position: 'fixed',
        top: '10px',
        left: '10px',
        zIndex: '9999999',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        pointerEvents: 'none',
        transition: 'opacity 0.5s ease-in-out',
        opacity: '0',
    });
    document.body.appendChild(displayContainer);

    function updateDisplay() {
        displayContainer.innerHTML = `
            <div style="color: aquamarine;">Speed: ${videoSpeed.toFixed(2)}</div>
            <div style="color: lightcoral;">Saturation: ${videoSaturation.toFixed(2)}</div>
            <div style="color: lightyellow;">Dynamic Acceleration: ${dynamicAcceleration.enable ? 'ON' : 'OFF'}</div>
        `;

        displayContainer.style.opacity = '1';

        clearTimeout(displayTimeout);
        displayTimeout = setTimeout(() => {
            displayContainer.style.opacity = '0';
        }, 3000);
    }

    function handlePressedKey(event) {
        const target = event.target;
        if (target.localName === "input" || target.localName === "textarea" || target.isContentEditable) return;

        const videos = Array.from(document.getElementsByTagName("video"));
        const video = videos.find(v => !v.paused && !v.ended && v.readyState > 2);
        if (!video) return;

        let newRate = video.playbackRate;
        switch (event.key) {
            case "[":
                newRate = Math.max(MIN_SPEED_RATE, video.playbackRate - SPEED_RATE_STEP);
                break;
            case "]":
                newRate = Math.min(MAX_SPEED_RATE, video.playbackRate + SPEED_RATE_STEP);
                break;
            case "{":
                videoSaturation = Math.max(MIN_SATURATION, videoSaturation - SATURATION_STEP);
                break;
            case "}":
                videoSaturation = Math.min(MAX_SATURATION, videoSaturation + SATURATION_STEP);
                break;
            case ":":
                dynamicAcceleration.enable = !dynamicAcceleration.enable;
                if (dynamicAcceleration.enable) {
                    dynamicAcceleration.startingSpeed = video.playbackRate;
                    dynamicAcceleration.startTime = video.currentTime;
                }
                break;
            case "`":
                newRate = 1;
                videoSaturation = 1;
                dynamicAcceleration.enable = false;
                break;
            default:
                return;
        }

        if (newRate !== video.playbackRate) {
            video.playbackRate = newRate;
            videoSpeed = newRate;
        }

        video.style.filter = `saturate(${videoSaturation})`;
        updateDisplay();
    }

    function updateDynamicAcceleration(video) {
        if (!dynamicAcceleration.enable) return;

        const elapsedTime = video.currentTime - dynamicAcceleration.startTime;
        const accelerationDuration = video.duration * dynamicAcceleration.percentage;

        if (elapsedTime <= accelerationDuration) {
            const speedIncrement = (dynamicAcceleration.finalSpeed - dynamicAcceleration.startingSpeed) *
                (elapsedTime / accelerationDuration);
            video.playbackRate = Math.min(dynamicAcceleration.startingSpeed + speedIncrement, dynamicAcceleration.finalSpeed);
            videoSpeed = video.playbackRate;
        }

        updateDisplay();
    }

    document.addEventListener("keydown", handlePressedKey);
    
    // Monitor all video elements
    const observeVideos = () => {
        const videos = document.getElementsByTagName('video');
        for (let video of videos) {
            if (!video.dataset.controlsAttached) {
                video.dataset.controlsAttached = 'true';
                video.addEventListener('play', () => {
                    dynamicAcceleration.startingSpeed = video.playbackRate;
                    dynamicAcceleration.enable = false;
                    updateDisplay();
                });
                
                const animationFrame = () => {
                    if (!video.paused && !video.ended) {
                        updateDynamicAcceleration(video);
                        requestAnimationFrame(animationFrame);
                    }
                };
                requestAnimationFrame(animationFrame);
            }
        }
    };

    // Observe DOM changes to catch dynamically added videos
    const observer = new MutationObserver(observeVideos);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial call to handle videos present on page load
    observeVideos();

})();
