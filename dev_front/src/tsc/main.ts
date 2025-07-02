const navbar = document.getElementById("navbar")!;
const doorLeft = document.getElementById("door-left")!;
const doorRight = document.getElementById("door-right")!;
const contentInner = document.getElementById("content-inner")!;
const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
const contentBox = document.getElementById("content-box")!;

let currentView: string = "login"; // default at start
let isAnimating = false;

// Utility to load external HTML into a string
async function loadHTML(path: string): Promise<string> {
	const res = await fetch(path);
	if (!res.ok)
		throw new Error(`Failed to load ${path}`);
	return await res.text();
}

const registeredUsers: string[] = [
  "alice",
  "bob",
  "carol",
  "dave",
  "eve",
  "frank",
];

function setupPlayerSelectLogic(container: HTMLElement) {
  const input = container.querySelector<HTMLInputElement>(".player-search-input")!;
  const dropdown = container.querySelector<HTMLUListElement>(".autocomplete-list")!;
  const addBtn = container.querySelector<HTMLButtonElement>(".add-player-btn")!;
  const lockInBtn = container.querySelector<HTMLButtonElement>(".lock-btn")!;

  let dropdownVisible = false;

  // 🔽 Update dropdown options
  const updateDropdown = (term = "") => {
    dropdown.innerHTML = "";

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

  // 👂 Input Events
  input.addEventListener("input", () => {
    const val = input.value.trim();
    updateDropdown(val);
  });

  input.addEventListener("focus", () => {
    updateDropdown(input.value.trim());
  });

  // 👋 Hide dropdown after brief delay (to allow clicks)
  input.addEventListener("blur", () => {
    setTimeout(() => {
      dropdown.classList.add("hidden");
      dropdownVisible = false;
    }, 150);
  });

  // ➕ Add player
  addBtn.addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) return;
    if (registeredUsers.includes(name)) {
      alert(`${name} is already registered.`);
    } else {
      registeredUsers.push(name);
      alert(`Added ${name} to the list.`);
      updateDropdown(""); // Refresh with new name
    }
  });

  // ✅ Lock in player
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




// Inject content into the content box and initialize events
async function setContentView(viewPath: string) {
	if (!contentInner) {
		console.error("Missing content-box in DOM");
		return;
	}

	const html = await loadHTML(viewPath);
	contentInner.innerHTML = html;
	currentView = viewPath;

	if (viewPath.includes("login")) setupLoginEvents();
	else if (viewPath.includes("home")) setupHomeEvents();
	else if (viewPath.includes("settings")) setupSettingsEvents();
	else if (viewPath.includes("signup")) setupSignupEvents();
	else if (viewPath.includes("profile")) setupProfileEvents();
	else if (viewPath.includes("quick-match")) setupQuickMatch();
	else if (viewPath.includes("tournament")) setupTournament();
}


//Transition to gameScreen

function setupIconNav() {
  const homeBtn = document.getElementById("home-btn");
  const profileBtn = document.getElementById("profile-btn");
  const settingsBtn = document.getElementById("settings-btn");

  homeBtn?.addEventListener("click", () => {
  setContentView("views/home.html");

  // Reset contentInner styles to default
  contentInner.classList.remove("hidden", "max-w-full", "opacity-0", "scale-105", "translate-y");
  contentInner.classList.add("max-w-md", "opacity-100", "scale-100");

  //canvas.classList.add("hidden");
  closeDoors();
});


  profileBtn?.addEventListener("click", () => {
    setContentView("views/profile.html");
	animatecontentBoxIn();
  });

  settingsBtn?.addEventListener("click", () => {
	setContentView("views/settings.html");
	animatecontentBoxIn();
  });
}

function  setGameView() 
{
	currentView="game";

	animatecontentBoxOut();
}

// Setup login form behavior
function setupLoginEvents() {
	currentView="login";
	toggleBackButton(false);
	const form = document.getElementById("login-form");
	const signupBtn = document.getElementById("signup-btn");
	animatecontentBoxIn();
	form?.addEventListener("submit", (e) => {
		e.preventDefault();
		setContentView("views/home.html");
	});

	signupBtn?.addEventListener("click", () => {
		setContentView("views/signup.html");
	});
}

// Setup home view behavior
function setupHomeEvents() {
	currentView="home";
	animatecontentBoxIn();
	toggleBackButton(false);
	document.querySelectorAll("[data-view]").forEach((btn) => {
		btn.addEventListener("click", () => {
			const view = (btn as HTMLElement).dataset.view;
			if (view === "settings") {
				setContentView("views/settings.html");
			}
			else if (view ==="profile")
				setContentView("views/profile.html")
			else if (view === "q-match")
				setContentView("views/quick-match.html")
			else if (view === "tournament")
				setContentView("views/tournament.html")
			else {
				// Future: trigger door animation to enter a game
				setGameView();
			}
		});
	});
}

function setupSignupEvents() {
	currentView="signup";
	const form = document.getElementById("signup-form");
	const loginBtn = document.getElementById("login-btn");

	toggleBackButton(true, () => 
	{
		setContentView("views/login.html");
	})

	form?.addEventListener("submit", (e) => {
		e.preventDefault();
		setContentView("views/home.html");
	});

	loginBtn?.addEventListener("click", () => {
		setContentView("views/login.html");
	});
}

// Placeholder for future settings events
function setupSettingsEvents() {
	currentView="settings";
	toggleBackButton(true, () => 
	{
		setContentView("views/home.html");
	})
}

function setupProfileEvents() {
	const statsBtn = document.getElementById("stats-btn");
  const logoutBtn = document.getElementById("logout-btn");

  currentView="profile";
  toggleBackButton(true, () =>
	{
		setContentView("views/home.html");
	});
  statsBtn?.addEventListener("click", () => {
    console.log("Show stats view");
    // setContentView("views/stats.html"); // If you have a stats page
  });

  logoutBtn?.addEventListener("click", () => {
    setContentView("views/login.html");
  });
}

function setupQuickMatch() {
  const container = document.getElementById("player-select-container")!;
  container.innerHTML = "";

  // Widen content box
  contentBox.classList.remove("max-w-md");
  contentBox.classList.add("max-w-3xl"); // Wider for dual player select

  toggleBackButton(true, () => {
    // Reset content box to default size when going back
    contentBox.classList.remove("max-w-3xl");
    contentBox.classList.add("max-w-md");
    setContentView("views/home.html");
  });
  const startBtn = document.getElementById("start-btn");
  const player1 = createPlayerSlot("player1-select");
  const player2 = createPlayerSlot("player2-select");

  container.appendChild(player1);
  container.appendChild(player2);
  startBtn?.addEventListener("click", () =>
	{
		setGameView();
	})
}

function setupTournament() {
  currentView = "tournament";

  // Set layout classes on contentBox if it's the grid
  contentBox.classList.remove("max-w-md", "flexbox");
  contentBox.classList.add("max-w-4xl");

  toggleBackButton(true, () => setContentView("views/home.html"));

  const container = document.getElementById("player-select-container")!;
  if (!container) return;

  // Apply grid layout to container
  container.className = "grid grid-cols-2 grid-rows-2 gap-4 w-full max-w-4xl mx-auto mt-8";

  container.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    const player = createPlayerSlot(`player-select-${i}`);
    container.appendChild(player);
  }

  const startBtn = document.getElementById("start-btn");
  startBtn?.addEventListener("click", () => {
    setGameView();
  });
}


async function loadPlayerSelect(id: string): Promise<HTMLElement> {
  const html = await fetch("views/player-selection.html").then(res => res.text());
  const temp = document.createElement("div");
  temp.innerHTML = html.trim();
  const selectionBox = temp.firstElementChild as HTMLElement;
  selectionBox.id = id;

  setupPlayerSelectLogic(selectionBox); // attach listeners, autocomplete, etc.
  return selectionBox;
}


function createPlayerSlot(id: string): HTMLElement {
  const template = document.getElementById("player-slot-template") as HTMLTemplateElement;
  const clone = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
  clone.id = id;

  clone.addEventListener("click", async () => {
    const container = clone.parentElement!;
    const selector = await loadPlayerSelect(id);
    container.replaceChild(selector, clone);
  });

  return clone;
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

function toggleBackButton(show: boolean, onClick?: () => void)
{
	const backBtn = document.getElementById("back-btn");
	if (!backBtn) return;

	if (show)
	{
		backBtn.classList.remove("hidden");
		backBtn.onclick = onClick || null;
	}
	else
	{
		backBtn.classList.add("hidden");
		backBtn.onclick = null;
	}
}

// Hide canvas (on login/home/settings)
function hideCanvas() {
	canvas?.classList.add("hidden");
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
	toggleIsAnimation(true);
  closeDoors();
  setTimeout(() =>
	{
		contentBox.classList.remove("hidden");

	  // Force reflow
	  contentBox.getBoundingClientRect();

	  contentBox.classList.remove("opacity-0", "scale-0");
	  contentBox.classList.add("opacity-100", "scale-100");
	}, 1000)
	toggleIsAnimation(false);
}

function animatecontentBoxOut() {
	toggleIsAnimation(true);
  contentBox.classList.remove("opacity-100", "scale-100");
  contentBox.classList.add("opacity-0", "scale-0");

  setTimeout(() => {
    contentBox.classList.add("hidden");
	openDoors();

  }, 600); // Match transition duration
  toggleIsAnimation(false);
}

function toggleIsAnimation(show: boolean)
{
	if (show === true)
		isAnimating = true;
	else
	{
		setTimeout(() =>
		{
			isAnimating = false;
		}, 1010);
	}
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isAnimating === false) {
	isAnimating = true;
	if (currentView.includes("home"))
	{
		currentView="game";
		animatecontentBoxOut();
	}
	else
	{
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
