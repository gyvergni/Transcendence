"use strict";
var _a;
(_a = document.getElementById("login-form")) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log("Logging in with", username, password);
    //CALL API
});
