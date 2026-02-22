// ==UserScript==
// @name         JoltSpace
// @description  Customize GameJolt profiles like SpaceHey/MySpace.
// @author       Stormwindsky
// @license      CC0-1.0
// @match        https://gamejolt.com/*
// @run-at       document-idle
// @grant        none
// @homepageURL  https://github.com/Stormwindsky/JoltSpace
// ==/UserScript==

/*
  JoltSpace - A profile customizer for GameJolt.
  Created by Stormwindsky.
  This work is marked with CC0 1.0 Universal.
  Repository: https://github.com/Stormwindsky/JoltSpace
*/

(function() {
    'use strict';

    let audioInstance = null;
    let currentMusicUrl = null;
    let lastUrl = location.href;

    function removeCustomization() {
        // Supprimer le curseur
        const style = document.getElementById('custom-cursor-style');
        if (style) style.remove();

        // Arrêter la musique
        if (audioInstance) {
            audioInstance.pause();
            audioInstance = null;
            currentMusicUrl = null;
        }
    }

    function applyCustomization() {
        // On s'assure que le profil est bien chargé
        const configLink = document.querySelector('a[href*="stormwindsky.com/Tools/Notepad/Notepad.html#"]');
        
        if (configLink) {
            const rawData = decodeURIComponent(configLink.href.split('#')[1]);

            // Extraction patterns
            const cursorMatch = rawData.match(/cursor\s*=\s*(https?:\/\/\S+)/);
            const musicMatch = rawData.match(/music\.play\s*=\s*(https?:\/\/\S+)/);
            const pfpMatch = rawData.match(/pfp\s*=\s*(https?:\/\/\S+)/);

            // 1. CURSOR CUSTOMIZATION
            if (cursorMatch) {
                if (!document.getElementById('custom-cursor-style')) {
                    const style = document.createElement('style');
                    style.id = 'custom-cursor-style';
                    style.innerHTML = `* { cursor: url("${cursorMatch[1]}"), auto !important; }`;
                    document.head.appendChild(style);
                }
            }

            // 2. PROFILE PICTURE
            if (pfpMatch) {
                const targetImg = document.querySelector('span.user-avatar-img img.img-responsive');
                if (targetImg && targetImg.src !== pfpMatch[1]) {
                    targetImg.src = pfpMatch[1];
                    targetImg.srcset = pfpMatch[1];
                }
            }

            // 3. BACKGROUND MUSIC
            if (musicMatch) {
                const newMusicUrl = musicMatch[1];
                if (!audioInstance || currentMusicUrl !== newMusicUrl) {
                    if (audioInstance) audioInstance.pause();
                    
                    const startMusic = () => {
                        if (!audioInstance || currentMusicUrl !== newMusicUrl) {
                            audioInstance = new Audio(newMusicUrl);
                            audioInstance.loop = true;
                            currentMusicUrl = newMusicUrl;
                            audioInstance.play().catch(() => console.log("Autoplay blocked. Click to play."));
                            window.removeEventListener('click', startMusic);
                        }
                    };
                    window.addEventListener('click', startMusic);
                }
            }
        } else {
            // Si on est sur une page sans lien de config, on nettoie tout
            removeCustomization();
        }
    }

    // Surveiller les changements de navigation (SPA)
    const observer = new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            // Petit délai pour laisser le temps au DOM du nouveau profil de se charger
            setTimeout(applyCustomization, 500);
        } else {
            applyCustomization();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial execution
    window.addEventListener('load', applyCustomization);
})();
