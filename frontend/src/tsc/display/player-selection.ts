import { PlayerConfig, MatchSetup, GameTypeManager } from "../utils/models.js";
import { currentLang, getTranslatedKey, setLang } from "../utils/translation.js";

function verifyGuestUsernameInputDatas(username: string) {
	if (username.match(/[^a-zA-Z0-9_]/))
		return "signup.username.invalid-chars";
	if (username.length < 3 || username.length > 10)
		return "signup.username.length";
	return "true";
}

async function loadPlayerSelect(id: string, config: PlayerConfig, gameType: GameTypeManager): Promise<HTMLElement> {
	const html = await fetch("views/player-selection.html").then(res => res.text());
	const temp = document.createElement("div");
	temp.innerHTML = html.trim();

	const match = gameType as MatchSetup;
	const guestsManager = match.getGuestsManager();

	await guestsManager.fetchGuests(null);

    const selectionBox = temp.querySelector(".player-select") as HTMLElement;
	if (!selectionBox) throw new Error("Could not find .player-select in template");

	selectionBox.id = id;

	const input = selectionBox.querySelector<HTMLInputElement>(".player-search-input")!;
	const dropdown = selectionBox.querySelector<HTMLUListElement>(".autocomplete-list")!;
	const addBtn = selectionBox.querySelector<HTMLButtonElement>(".add-guest-btn")!;
	const deleteBtn = selectionBox.querySelector<HTMLButtonElement>(".delete-guest-btn")!;
	const lockInBtn = selectionBox.querySelector<HTMLButtonElement>(".lock-btn")!;

	let dropdownVisible = false;

	const updateDropdown = (term = "") => {
		dropdown.innerHTML = "";

	let registeredUsers: string[] = guestsManager.guests.map(guest => guest.pseudo);
	registeredUsers.push(guestsManager.host);
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

	addBtn.addEventListener("click", async () => {
	let registeredUsers: string[] = guestsManager.guests.map(guest => guest.pseudo);
		const name = input.value.trim();
		if (!name) return;

		if (guestsManager.pseudoExists(name)) {
			alert(getTranslatedKey("error.guest.add.already_exists"));
	} else {
			const err = verifyGuestUsernameInputDatas(name);
			if (err && err != "true") {
				alert(getTranslatedKey(err));
		} else {
				const result = await guestsManager.addGuest(name);
				if (result.succes == true) {
					registeredUsers = guestsManager.guests.map(guest => guest.pseudo);
					updateDropdown("");
				} else {
					alert(getTranslatedKey(result.message));
				}
			}
		}
	});

	deleteBtn.addEventListener("click", async () => {
	    let registeredUsers: string[] = guestsManager.guests.map(guest => guest.pseudo);
	    registeredUsers.push(guestsManager.host);
	    const name = input.value.trim();
	    if (!name)
            return;
	    if (name === guestsManager.host) {
	    	alert(getTranslatedKey("error.guest.delete_host"));
	    	return;
	    }
        else if (!guestsManager.pseudoExists(name)) {
	    	alert(getTranslatedKey("error.guest.delete.not_found"));
	    	return;
	    }
        else if (gameType.getPlayers().some(p => p && p.name === name)) {
	    	alert(getTranslatedKey("error.guest.delete_locked_in"));
	    	return;
	    }
        else {
	    	const result = await guestsManager.deleteGuest(name);
	    	if (result.succes == true)
            {
	    		registeredUsers = guestsManager.guests.map(guest => guest.pseudo);
	    		input.value = "";
	    		updateDropdown("");
	    	}
            else
            {
	    		alert(getTranslatedKey("error.guest.delete_failed") + `: ${result.message}`);
	    	}
	    }
	})

	lockInBtn.addEventListener("click", () => {
	let registeredUsers: string[] = guestsManager.guests.map(guest => guest.pseudo);
	registeredUsers.push(guestsManager.host);
		const name = input.value.trim();
		if (!registeredUsers.includes(name)) {
			alert(getTranslatedKey("error.guest.unregistered"));
			return;
		}
		let playerList = gameType.getPlayers();
		for (let i = 0; i < playerList.length; i++)
		{
			if (playerList[i] != null && name == playerList[i].name)
			{
				alert(getTranslatedKey("error.guest.already_locked_in"));
				return;
			}
		}
		config.setName(name);
		config.lockIn();

		const readyBox = document.createElement("div");
		readyBox.className = "text-green-400 text-center text-md font-semibold border border-green-400 p-4 rounded";
		readyBox.textContent = `${getTranslatedKey("player.ready")}: ${name}`;
		selectionBox.replaceWith(readyBox);
	});

	return selectionBox;
}


async function loadAISelect(id: string, config: PlayerConfig): Promise<HTMLElement> {
    const res = await fetch("views/ai-selection.html");
	const html = await res.text();
	const wrapper = document.createElement("div");
	wrapper.innerHTML = html.trim();
	const selector = wrapper.querySelector(".ai-selector") as HTMLElement;
	if (!selector) throw new Error("Could not find .ai-selector in template");
    let selectedDifficulty: string | null = null;
	const buttons = selector.querySelectorAll<HTMLButtonElement>(".difficulty-btn");
	
	buttons.forEach((btn) => {
		btn.addEventListener("click", () => {
			buttons.forEach((b) => { b.classList.remove("bg-cyan-700"); b.classList.add("bg-slate-700"); });
			btn.classList.remove("bg-slate-700"); btn.classList.add("bg-cyan-700");
			selectedDifficulty = btn.dataset.difficulty!;
		});
	});

	const lockBtn = selector.querySelector<HTMLButtonElement>(".lockin-btn");
	lockBtn?.addEventListener("click", () => {
		if (!selectedDifficulty) {
			alert(getTranslatedKey("ai.difficulty.null"));
			return;
		}
		config.setDifficulty(selectedDifficulty as any);
		config.name = "ai-" + selectedDifficulty;
		config.lockIn();

		const readyBox = document.createElement("div");
		readyBox.className = "text-green-400 text-center text-md font-semibold border border-green-400 p-4 rounded";
		readyBox.textContent = `${getTranslatedKey("player.ready")}: ${getTranslatedKey("player.ai-" + selectedDifficulty)}`;
		selector.replaceWith(readyBox);
	});

	return selector;
}

async function loadTemplate(path: string, templateId: string): Promise<HTMLTemplateElement> {
	const res = await fetch(path);
	const html = await res.text();

	const temp = document.createElement("div");
	temp.innerHTML = html.trim();
	const template = temp.querySelector(`#${templateId}`) as HTMLTemplateElement | null;
	if (!template) throw new Error(`Template with id "${templateId}" not found in ${path}`);
	return template;
}


// Create slot
export async function createPlayerSlot(id: string, config: PlayerConfig, gameType: GameTypeManager): Promise<HTMLElement> {
	const template = await loadTemplate("views/player-slot-template.html", "player-slot-template") as HTMLTemplateElement;
	const clone = template.content.querySelector(".player-slot")?.cloneNode(true) as HTMLElement;
	if (!clone)
        throw new Error(".player-slot not found in template");
	clone.id = id;
	clone.addEventListener("click", async (event) => {
		try
        {
            const target = event.target as HTMLElement;
		    const roleElement = target.closest("[data-choice]") as HTMLElement | null;
		    if (!roleElement) return;

		    const container = clone.parentElement!;
		    const role = roleElement.dataset.choice;
		    gameType.addPlayer(config);
		    let selector: HTMLElement;
		    if (role === "player") {
		    	config.type = "human";
		    	selector = await loadPlayerSelect(id, config, gameType);
		    }
		    else if (role === "ai") {
		    	config.type = "ai";
		    	selector = await loadAISelect(id, config);
		    }
		    else
		    	return;

		    container.replaceChild(selector, clone);
		    setLang(currentLang);
        }
        catch (e)
        {
            console.error("Error creating player slot", e);
        }
	});

	return clone;
}
