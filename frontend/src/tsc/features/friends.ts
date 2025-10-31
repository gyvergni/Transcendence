import { toggleBackButton } from "../display/animations";
import { setContentView } from "../display/viewHandler";
import { API_BASE_URL, getApiErrorText } from "../utils/utilsApi";
import { getTranslatedKey } from "../utils/translation";

type Friend = {
	id: number;
	pseudo: string;
	game_username: string;
	status: boolean;
	avatar: string;
}

export let friendsCache: Friend[] = [];

export async function fetchFriends() {
	friendsCache = [];
	try {
		const response = await fetch(API_BASE_URL + '/users/friend', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
			}
		});

		if (!response.ok) {
			console.error("Failed to fetch friends. Status:", response.status);
			friendsCache = [];
			return;
		}

		const data = await response.json();
		friendsCache = data as Friend[];
		
		friendsCache.forEach(f => {
			f.avatar = API_BASE_URL + '/public/avatars/' + f.avatar + '?t=' + Date.now();
		});

		friendsCache = friendsCache.sort((a, b) => {
			if (a.status !== b.status) {
				return b.status ? 1 : -1;
			}
			return a.pseudo.localeCompare(b.pseudo);
		})

		return ;
	} catch (error) {
		console.error("Error fetching friends:", error);
		friendsCache = [];
		return;
	}
}

export async function renderFriends(root: HTMLElement, tpl: HTMLTemplateElement, term: string, skipFetch = false) {
	if (!skipFetch) {
		await fetchFriends();
	}
	
	const list = friendsCache;
	const q = term.trim().toLowerCase();
	const filtered = q ? list.filter(f => f.pseudo.toLowerCase().includes(q) || f.game_username.toLowerCase().includes(q)) : list;

	const fragment = document.createDocumentFragment();

	for (const f of filtered) {
		const node = tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;

		const img = node.querySelector("img")! as HTMLImageElement;
		img.style.visibility = "hidden";
		img.src = f.avatar;
		img.onload = () => {
			img.style.visibility = "visible";
		};
		const dot = node.querySelector("span")! as HTMLSpanElement;
		dot.classList.remove("bg-red-500", "bg-green-500");
		dot.classList.add(f.status ? "bg-green-500" : "bg-red-500");

		const pseudo = node.querySelector(".friend-pseudo")! as HTMLElement;
		pseudo.textContent = f.pseudo;

		const gameUsername = node.querySelector(".friend-game-username")! as HTMLElement;
		gameUsername.textContent = f.game_username;
		
		node.setAttribute("data-pseudo", f.pseudo);

		const removeBtn = node.querySelector(".remove-friend-btn")! as HTMLButtonElement;
		removeBtn.setAttribute("data-pseudo", f.pseudo);
		
		fragment.appendChild(node);
	}

	if (filtered.length === 0) {
		const empty = document.createElement("li");
		empty.className = "p-3 text-sm text-slate-400";
		empty.textContent = q ? getTranslatedKey("friends.search.noMatch") : getTranslatedKey("friends.noFriends");
		fragment.appendChild(empty);
	}

	root.innerHTML = "";
	root.appendChild(fragment);
}

export async function addFriend(e: Event, form: HTMLFormElement) {
	e.preventDefault();
	try {
		const formData = new FormData(form);
		const friendPseudo = formData.get('friend-pseudo') as string;

		if (!friendPseudo) {
			console.error("Friend pseudo is required.");
			return;
		}

		const response = await fetch(API_BASE_URL + '/users/friend', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
			},
			body: JSON.stringify({ pseudo: friendPseudo })
		})
		if (!response.ok) {
			const errorData = await response.json();
			const errorDiv = document.querySelector("#add-friend-error") as HTMLDivElement;
			errorDiv.textContent = getApiErrorText(errorData);
			console.error("Failed to add friend. Status:", response.status, "Message:", getApiErrorText(errorData));
			return ;
		}
		await fetchFriends();
		toggleBackButton(true, () => {
			history.back();
		});
		document.querySelector("#add-friend-error")!.textContent = "";
		document.querySelector("#add-friend-form-container")?.classList.replace("flex", "hidden");
		formData.delete('friend-pseudo');
		form.reset();
		return;
	} catch (error) {
		console.error("Error adding friend:", error);
	}
}

export async function deleteFriend(e:Event, root: HTMLElement, tpl: HTMLTemplateElement, search: HTMLInputElement) {
	const removeBtn = (e.target as HTMLElement).closest(".remove-friend-btn") as HTMLButtonElement;
	if (!removeBtn) {
	
		console.error("Remove button not found.");
		return;
	} 

	const friendPseudo = removeBtn.getAttribute("data-pseudo");
	if (!friendPseudo) return ;

	try {
		const response = await fetch(API_BASE_URL + '/users/friend', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
			},
			body: JSON.stringify({ pseudo: friendPseudo })
		});

		if (!response.ok) {
			try {
				const errorData = await response.json();
				console.error("Failed to remove friend. Status:", response.status, getApiErrorText(errorData));
			} catch {}
			return ;
		}
		await renderFriends(root, tpl, search.value);
		return;
	} catch (error) {
		console.error("Error removing friend:", error);
		return ;
	}
}