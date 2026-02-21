// ==UserScript==
// @name         JoltSpace
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Customize GameJolt profiles like SpaceHey/MySpace.
// @author       Stormwindsky
// @license      CC0-1.0
// @match        https://gamejolt.com/@*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

/*
  JoltSpace - A profile customizer for GameJolt.
  Created by Stormwindsky.
  This work is marked with CC0 1.0 Universal.
*/

(function() {
    'use strict';

    let audioInstance = null;

    function applyCustomization() {
        // Look for the config link in the profile (Notepad link)
        const configLink = document.querySelector('a[href*="stormwindsky.com/Tools/Notepad/Notepad.html#"]');
        
        if (configLink) {
            const rawData = decodeURIComponent(configLink.href.split('#')[1]);

            // Extraction patterns
            const cursorMatch = rawData.match(/cursor\s*=\s*(https?:\/\/\S+)/);
            const musicMatch = rawData.match(/music\.play\s*=\s*(https?:\/\/\S+)/);
            const pfpMatch = rawData.match(/pfp\s*=\s*(https?:\/\/\S+)/);

            // 1. CURSOR CUSTOMIZATION
            if (cursorMatch && !document.getElementById('custom-cursor-style')) {
                const style = document.createElement('style');
                style.id = 'custom-cursor-style';
                style.innerHTML = `* { cursor: url("${cursorMatch[1]}"), auto !important; }`;
                document.head.appendChild(style);
            }

            // 2. PROFILE PICTURE (Targeting span.user-avatar-img img.img-responsive)
            if (pfpMatch) {
                const targetImg = document.querySelector('span.user-avatar-img img.img-responsive');
                if (targetImg && targetImg.src !== pfpMatch[1]) {
                    targetImg.src = pfpMatch[1];
                    targetImg.srcset = pfpMatch[1]; // Override responsive sets
                }
            }

            // 3. BACKGROUND MUSIC (Infinite Loop)
            if (musicMatch && !audioInstance) {
                const startMusic = () => {
                    if (!audioInstance) {
                        audioInstance = new Audio(musicMatch[1]);
                        audioInstance.loop = true; // Restarts when finished
                        audioInstance.play().catch(e => console.log("Autoplay blocked. Click anywhere to play music."));
                        window.removeEventListener('click', startMusic);
                    }
                };
                window.addEventListener('click', startMusic);
            }
        }
    }

    // Monitor DOM changes for SPA navigation
    const observer = new MutationObserver(applyCustomization);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial execution
    applyCustomization();
})();