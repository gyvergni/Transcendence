import uiManager from "./main.js";
export function toggleBackButton(show, onClick) {
    const backBtn = document.getElementById("back-btn");
    if (!backBtn)
        return;
    if (show) {
        backBtn.classList.remove("hidden");
        backBtn.onclick = onClick || null;
    }
    else {
        backBtn.classList.add("hidden");
        backBtn.onclick = null;
    }
}
// Door animation helpers
function openDoors() {
    uiManager.doorLeft.classList.add("-translate-x-full");
    uiManager.doorRight.classList.add("translate-x-full");
}
function closeDoors() {
    uiManager.doorLeft.classList.remove("-translate-x-full");
    uiManager.doorRight.classList.remove("translate-x-full");
}
export function animateContentBoxIn() {
    toggleIsAnimation(true);
    closeDoors();
    setTimeout(() => {
        uiManager.contentBox.classList.remove("hidden");
        // Force reflow
        uiManager.contentBox.getBoundingClientRect();
        uiManager.contentBox.classList.remove("opacity-0", "scale-0");
        uiManager.contentBox.classList.add("opacity-100", "scale-100");
    }, 1000);
    toggleIsAnimation(false);
}
export function animateContentBoxOut() {
    toggleIsAnimation(true);
    uiManager.contentBox.classList.remove("opacity-100", "scale-100");
    uiManager.contentBox.classList.add("opacity-0", "scale-0");
    setTimeout(() => {
        uiManager.contentBox.classList.add("hidden");
        openDoors();
    }, 600); // Match transition duration
    toggleIsAnimation(false);
}
function toggleIsAnimation(show) {
    if (show === true)
        uiManager.setIsAnimating(true);
    else {
        setTimeout(() => {
            uiManager.setIsAnimating(false);
        }, 1010);
    }
}
