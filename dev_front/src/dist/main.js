"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const navbar = document.getElementById("navbar");
const doorLeft = document.getElementById("door-left");
const doorRight = document.getElementById("door-right");
const contentInner = document.getElementById("content-inner");
const canvas = document.getElementById("game-canvas");
const contentBox = document.getElementById("content-box");
let currentView = "login"; // default at start
// Utility to load external HTML into a string
function loadHTML(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(path);
        if (!res.ok)
            throw new Error(`Failed to load ${path}`);
        return yield res.text();
    });
}
// Inject content into the content box and initialize events
function setContentView(viewPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!contentInner) {
            console.error("Missing content-box in DOM");
            return;
        }
        const html = yield loadHTML(viewPath);
        contentInner.innerHTML = html;
        currentView = viewPath;
        if (viewPath.includes("login"))
            setupLoginEvents();
        else if (viewPath.includes("home"))
            setupHomeEvents();
        else if (viewPath.includes("settings"))
            setupSettingsEvents();
        else if (viewPath.includes("signup"))
            setupSignupEvents();
        else if (viewPath.includes("profile"))
            setupProfileEvents();
    });
}
//Transition to gameScreen
function setupIconNav() {
    const homeBtn = document.getElementById("home-btn");
    const profileBtn = document.getElementById("profile-btn");
    const settingsBtn = document.getElementById("settings-btn");
    homeBtn === null || homeBtn === void 0 ? void 0 : homeBtn.addEventListener("click", () => {
        setContentView("views/home.html");
        // Reset contentInner styles to default
        contentInner.classList.remove("hidden", "max-w-full", "opacity-0", "scale-105", "translate-y");
        contentInner.classList.add("max-w-md", "opacity-100", "scale-100");
        //canvas.classList.add("hidden");
        closeDoors();
    });
    profileBtn === null || profileBtn === void 0 ? void 0 : profileBtn.addEventListener("click", () => {
        setContentView("views/profile.html");
        animatecontentBoxIn();
    });
    settingsBtn === null || settingsBtn === void 0 ? void 0 : settingsBtn.addEventListener("click", () => {
        setContentView("views/settings.html");
        animatecontentBoxIn();
    });
}
function setGameView() {
    currentView = "game";
    animatecontentBoxOut();
    openDoors();
}
// Setup login form behavior
function setupLoginEvents() {
    currentView = "login";
    toggleBackButton(false);
    const form = document.getElementById("login-form");
    const signupBtn = document.getElementById("signup-btn");
    animatecontentBoxIn();
    form === null || form === void 0 ? void 0 : form.addEventListener("submit", (e) => {
        e.preventDefault();
        setContentView("views/home.html");
    });
    signupBtn === null || signupBtn === void 0 ? void 0 : signupBtn.addEventListener("click", () => {
        setContentView("views/signup.html");
    });
}
// Setup home view behavior
function setupHomeEvents() {
    currentView = "home";
    animatecontentBoxIn();
    toggleBackButton(false);
    document.querySelectorAll("[data-view]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const view = btn.dataset.view;
            if (view === "settings") {
                setContentView("views/settings.html");
            }
            else if (view === "profile")
                setContentView("views/profile.html");
            else if (view === "1v1")
                setContentView("views/1v1.html");
            else {
                // Future: trigger door animation to enter a game
                setGameView();
            }
        });
    });
}
function setupSignupEvents() {
    currentView = "signup";
    const form = document.getElementById("signup-form");
    const loginBtn = document.getElementById("login-btn");
    toggleBackButton(true, () => {
        setContentView("views/login.html");
    });
    form === null || form === void 0 ? void 0 : form.addEventListener("submit", (e) => {
        e.preventDefault();
        setContentView("views/home.html");
    });
    loginBtn === null || loginBtn === void 0 ? void 0 : loginBtn.addEventListener("click", () => {
        setContentView("views/login.html");
    });
}
// Placeholder for future settings events
function setupSettingsEvents() {
    currentView = "settings";
    toggleBackButton(true, () => {
        setContentView("views/home.html");
    });
}
function setupProfileEvents() {
    const statsBtn = document.getElementById("stats-btn");
    const logoutBtn = document.getElementById("logout-btn");
    currentView = "profile";
    toggleBackButton(true, () => {
        setContentView("views/home.html");
    });
    statsBtn === null || statsBtn === void 0 ? void 0 : statsBtn.addEventListener("click", () => {
        console.log("Show stats view");
        // setContentView("views/stats.html"); // If you have a stats page
    });
    logoutBtn === null || logoutBtn === void 0 ? void 0 : logoutBtn.addEventListener("click", () => {
        setContentView("views/login.html");
    });
}
// Show canvas for game views
function showCanvas() {
    if (canvas) {
        canvas.classList.remove("hidden");
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
}
function toggleBackButton(show, onClick) {
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
// Hide canvas (on login/home/settings)
function hideCanvas() {
    canvas === null || canvas === void 0 ? void 0 : canvas.classList.add("hidden");
}
// Door animation helpers
function openDoors() {
    doorLeft.classList.add("-translate-x-full");
    doorRight.classList.add("translate-x-full");
}
function closeDoors() {
    doorLeft.classList.remove("-translate-x-full");
    doorRight.classList.remove("translate-x-full");
}
function animatecontentBoxIn() {
    closeDoors();
    // Make sure it's visible before animation starts
    // Force reflow
    contentBox.getBoundingClientRect();
    contentBox.classList.remove("hidden", "max-w-full", "opacity-100");
    contentBox.classList.add("max-w-md");
    // Fade in
    setTimeout(() => {
        contentBox.classList.remove("opacity-0");
        contentBox.classList.add("scale-105", "opacity-100");
    }, 1050); // wait for doors to close
}
function animatecontentBoxOut() {
    contentBox.classList.remove("max-w-md", "opacity-100", "scale-100");
    contentBox.classList.add("max-w-full", "opacity-0", "scale-105");
    setTimeout(() => {
        contentBox.classList.add("hidden");
    }, 1050);
}
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (currentView.includes("home")) {
            currentView = "game";
            openDoors();
            animatecontentBoxOut();
        }
        else {
            animatecontentBoxIn();
            setContentView("views/home.html");
        }
    }
});
// Initial DOM setup
document.addEventListener("DOMContentLoaded", () => {
    setupIconNav();
    setContentView("views/login.html");
});
