
const registeredUsers: string[] = ["alice", "bob", "carol", "dave", "eve", "frank"];


function setupPlayerSelect(container: HTMLElement) {
	const input = container.querySelector<HTMLInputElement>(".player-search-input")!;
	const dropdown = container.querySelector<HTMLUListElement>(".autocomplete-list")!;
	const addBtn = container.querySelector<HTMLButtonElement>(".add-player-btn")!;
	const lockInBtn = container.querySelector<HTMLButtonElement>(".lock-btn")!;	
	let dropdownVisible = false;		
	const updateDropdown = (term = "") => {
	  dropdown.innerHTML = "";
	  // API GET Pour récupérer la liste des utilisateurs
	  const matches = registeredUsers.filter(name =>
	    name.toLowerCase().includes(term.toLowerCase())
	  );	
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
	  if (!name) return;
	  if (registeredUsers.includes(name)) {
	    alert(`${name} is already registered.`);
	  } else {
		// API POST pour ajouter le guest 
	    registeredUsers.push(name);
	    alert(`Added ${name} to the list.`);
	    updateDropdown(""); // Refresh with new name
	  }
	});	
	// Lock in player
	lockInBtn.addEventListener("click", () => {
		// TODO enregistrer le joueur actif quelque part pour les calls API in-game et post-game
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


async function loadPlayerSelect(id: string): Promise<HTMLElement> {
	const html = await fetch("views/player-selection.html").then(res => res.text());
	const temp = document.createElement("div");
	temp.innerHTML = html.trim();
	const selectionBox = temp.firstElementChild as HTMLElement;
	selectionBox.id = id;	
	setupPlayerSelect(selectionBox); // attach listeners, autocomplete, etc.
	return selectionBox;
}

export async function loadAISelect(id: string): Promise<HTMLElement> {
	
	const res = await fetch("views/ai-selection.html");
	const html = await res.text();	
	const wrapper = document.createElement("div");

	wrapper.innerHTML = html.trim();	
	const selector = wrapper.firstElementChild as HTMLElement;	
	let selectedDifficulty: string | null = null;	
	const buttons = selector.querySelectorAll<HTMLButtonElement>(".difficulty-btn");
	buttons.forEach((btn) => {
	  btn.addEventListener("click", () => {
	    // Deselect all
	    buttons.forEach((b) => {
			b.classList.remove("bg-cyan-700");
			b.classList.add("bg-slate-700");
		})
			// Select current
		btn.classList.remove("bg-slate-700")
	    btn.classList.add("bg-cyan-700");
	    selectedDifficulty = btn.dataset.difficulty!;
	  });
	});	
	const lockBtn = selector.querySelector<HTMLButtonElement>(".lockin-btn");
	lockBtn?.addEventListener("click", () => {
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
}

export function createPlayerSlot(id: string): HTMLElement {
	const template = document.getElementById("player-slot-template") as HTMLTemplateElement;
	const clone = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
	clone.id = id;	
	clone.addEventListener("click", async (event) => {
	  const target = event.target as HTMLElement;
	  const roleElement = target.closest("[data-choice]") as HTMLElement | null;	
	  if (!roleElement) return;	
	  const container = clone.parentElement!;
	  const role = roleElement.dataset.choice;	
	  let selector: HTMLElement;
	  if (role === "player") {
	    selector = await loadPlayerSelect(id);
	  } else if (role === "ai") {
	    selector = await loadAISelect(id); // Adjust function name as needed
	  } else {
	    return;
	  }	
	  container.replaceChild(selector, clone);
	});	
	return clone;
}
