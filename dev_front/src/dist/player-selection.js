var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const registeredUsers = ["alice", "bob", "carol", "dave", "eve", "frank"];
function check_name(name, config) {
    if (config != null && config.name == name)
        return 1;
    return 0;
}
// Human player selector
function loadPlayerSelect(id, config, gameType) {
    return __awaiter(this, void 0, void 0, function* () {
        const html = yield fetch("../views/player-selection.html").then(res => res.text());
        const temp = document.createElement("div");
        temp.innerHTML = html.trim();
        const selectionBox = temp.querySelector(".player-select");
        if (!selectionBox)
            throw new Error("Could not find .player-select in template");
        selectionBox.id = id;
        const input = selectionBox.querySelector(".player-search-input");
        const dropdown = selectionBox.querySelector(".autocomplete-list");
        const addBtn = selectionBox.querySelector(".add-player-btn");
        const lockInBtn = selectionBox.querySelector(".lock-btn");
        let dropdownVisible = false;
        const updateDropdown = (term = "") => {
            dropdown.innerHTML = "";
            const matches = registeredUsers.filter(name => name.toLowerCase().includes(term.toLowerCase()));
            if (matches.length === 0) {
                dropdown.classList.add("hidden");
                dropdownVisible = false;
                return;
            }
            matches.forEach(name => {
                const li = document.createElement("li");
                li.textContent = name;
                li.className = "px-2 py-1 hover:bg-cyan-700 cursor-pointer";
                li.addEventListener("mousedown", (e) => {
                    e.preventDefault();
                    input.value = name;
                    dropdown.classList.add("hidden");
                    dropdownVisible = false;
                });
                dropdown.appendChild(li);
            });
            dropdown.classList.remove("hidden");
            dropdownVisible = true;
        };
        input.addEventListener("input", () => updateDropdown(input.value.trim()));
        input.addEventListener("focus", () => updateDropdown(input.value.trim()));
        input.addEventListener("blur", () => {
            setTimeout(() => { dropdown.classList.add("hidden"); dropdownVisible = false; }, 150);
        });
        addBtn.addEventListener("click", () => {
            const name = input.value.trim();
            if (!name)
                return;
            if (registeredUsers.includes(name)) {
                alert(`${name} is already registered.`);
            }
            else {
                registeredUsers.push(name);
                alert(`Added ${name} to the list.`);
                updateDropdown("");
            }
        });
        lockInBtn.addEventListener("click", () => {
            const name = input.value.trim();
            if (!registeredUsers.includes(name)) {
                alert("Please select a valid registered player.");
                return;
            }
            let playerList = gameType.getPlayers();
            for (let i = 0; i < playerList.length; i++) {
                if (playerList[i] != null && name == playerList[i].name) {
                    alert(`${name} is already locked in`);
                    return;
                }
            }
            config.setName(name);
            config.lockIn();
            const readyBox = document.createElement("div");
            readyBox.className = "text-green-400 text-center text-md font-semibold border border-green-400 p-4 rounded";
            readyBox.textContent = `✅ Ready: ${name}`;
            selectionBox.replaceWith(readyBox);
        });
        return selectionBox;
    });
}
// AI selector
function loadAISelect(id, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch("views/ai-selection.html");
        const html = yield res.text();
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html.trim();
        const selector = wrapper.querySelector(".ai-selector");
        if (!selector)
            throw new Error("Could not find .ai-selector in template");
        let selectedDifficulty = null;
        const buttons = selector.querySelectorAll(".difficulty-btn");
        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                buttons.forEach((b) => { b.classList.remove("bg-cyan-700"); b.classList.add("bg-slate-700"); });
                btn.classList.remove("bg-slate-700");
                btn.classList.add("bg-cyan-700");
                selectedDifficulty = btn.dataset.difficulty;
            });
        });
        const lockBtn = selector.querySelector(".lockin-btn");
        lockBtn === null || lockBtn === void 0 ? void 0 : lockBtn.addEventListener("click", () => {
            if (!selectedDifficulty) {
                alert("Please select a difficulty first.");
                return;
            }
            config.setDifficulty(selectedDifficulty);
            config.lockIn();
            const readyBox = document.createElement("div");
            readyBox.className = "text-green-400 text-center text-md font-semibold border border-green-400 p-4 rounded";
            readyBox.textContent = `Ready: AI (${selectedDifficulty})`;
            selector.replaceWith(readyBox);
        });
        return selector;
    });
}
// Create slot
export function createPlayerSlot(id, config, gameType) {
    var _a;
    const template = document.getElementById("player-slot-template");
    const clone = (_a = template.content.querySelector(".player-slot")) === null || _a === void 0 ? void 0 : _a.cloneNode(true);
    if (!clone)
        throw new Error(".player-slot not found in template");
    clone.id = id;
    clone.addEventListener("click", (event) => __awaiter(this, void 0, void 0, function* () {
        const target = event.target;
        const roleElement = target.closest("[data-choice]");
        if (!roleElement)
            return;
        const container = clone.parentElement;
        const role = roleElement.dataset.choice;
        gameType.addPlayer(config);
        let selector;
        if (role === "player") {
            config.type = "human";
            selector = yield loadPlayerSelect(id, config, gameType);
        }
        else if (role === "ai") {
            config.type = "ai";
            selector = yield loadAISelect(id, config);
        }
        else
            return;
        container.replaceChild(selector, clone);
    }));
    return clone;
}
