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
function setupPlayerSelectLogic(container) {
    const input = container.querySelector(".player-search-input");
    const dropdown = container.querySelector(".autocomplete-list");
    const addBtn = container.querySelector(".add-player-btn");
    const lockInBtn = container.querySelector(".lock-btn");
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
                e.preventDefault(); // Prevent blur
                input.value = name;
                dropdown.classList.add("hidden");
                dropdownVisible = false;
            });
            dropdown.appendChild(li);
        });
        dropdown.classList.remove("hidden");
        dropdownVisible = true;
    };
    input.addEventListener("input", () => {
        const val = input.value.trim();
        updateDropdown(val);
    });
    input.addEventListener("focus", () => {
        updateDropdown(input.value.trim());
    });
    input.addEventListener("blur", () => {
        setTimeout(() => {
            dropdown.classList.add("hidden");
            dropdownVisible = false;
        }, 150);
    });
    // Add player
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
            updateDropdown(""); // Refresh with new name
        }
    });
    // Lock in player
    lockInBtn.addEventListener("click", () => {
        const name = input.value.trim();
        if (!registeredUsers.includes(name)) {
            alert("Please select a valid registered player.");
            return;
        }
        const readyBox = document.createElement("div");
        readyBox.className = "text-green-400 text-center text-md font-semibold border border-green-400 p-4 rounded";
        readyBox.textContent = `✅ Ready: ${name}`;
        container.replaceWith(readyBox);
    });
}
function loadPlayerSelect(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const html = yield fetch("views/player-selection.html").then(res => res.text());
        const temp = document.createElement("div");
        temp.innerHTML = html.trim();
        const selectionBox = temp.firstElementChild;
        selectionBox.id = id;
        setupPlayerSelectLogic(selectionBox); // attach listeners, autocomplete, etc.
        return selectionBox;
    });
}
export function loadAISelect(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch("views/ai-selection.html");
        const html = yield res.text();
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html.trim();
        const selector = wrapper.firstElementChild;
        let selectedDifficulty = null;
        const buttons = selector.querySelectorAll(".difficulty-btn");
        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                // Deselect all
                buttons.forEach((b) => {
                    b.classList.remove("bg-cyan-700");
                    b.classList.add("bg-slate-700");
                });
                // Select current
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
            console.log(`AI difficulty locked in: ${selectedDifficulty}`);
            const readyBox = document.createElement("div");
            readyBox.className = "text-green-400 text-center text-md font-semibold border border-green-400 p-4 rounded";
            readyBox.textContent = `✅ Ready: ${name}`;
            selector.replaceWith(readyBox);
            // TODO: Save this selection in game state, or send to backend
        });
        return selector;
    });
}
export function createPlayerSlot(id) {
    const template = document.getElementById("player-slot-template");
    const clone = template.content.firstElementChild.cloneNode(true);
    clone.id = id;
    clone.addEventListener("click", (event) => __awaiter(this, void 0, void 0, function* () {
        const target = event.target;
        const roleElement = target.closest("[data-choice]");
        if (!roleElement)
            return;
        const container = clone.parentElement;
        const role = roleElement.dataset.choice;
        let selector;
        if (role === "player") {
            selector = yield loadPlayerSelect(id);
        }
        else if (role === "ai") {
            selector = yield loadAISelect(id); // Adjust function name as needed
        }
        else {
            return;
        }
        container.replaceChild(selector, clone);
    }));
    return clone;
}
