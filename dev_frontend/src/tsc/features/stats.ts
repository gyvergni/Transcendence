import { API_BASE_URL } from "./utils-api.js";
import { GuestsManager } from "../models.js";

type MatchStatsResponse = {
  id: number;
  username: string;
  wins: number;
  losses: number;
  matchHistory: {
    id: number;
    player1Username: string;
    player2Username: string;
    player1Score: number;
    player2Score: number;
    matchSettings: {
      ballSize: number;
      ballSpeed: number;
      paddleSize: number;
      paddleSpeed: number;
      gameMode: string;
    };
    matchStats: {
      totalHits: number;
      longestRallyHits: number;
      longestRallyTime: number;
      timeDuration: number;
      pointsOrder: string[];
    };
  }[];
};

async function fetchStats(accountUsername: string, guest?: string): Promise<MatchStatsResponse | null> {
  try {
    const url = new URL(`${API_BASE_URL}/stats/${encodeURIComponent(accountUsername)}`);
    if (guest) {
      url.searchParams.set("guest", guest);
    }

    const res = await fetch(url.toString(), {
      headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as MatchStatsResponse;
  } catch (err) {
    console.error("Failed to fetch stats", err);
    return null;
  }
}

function renderSummary(data: MatchStatsResponse) {
  const totalGames = data.wins + data.losses;
  const winRate = totalGames > 0 ? Math.round((data.wins / totalGames) * 100) : 0;

  const avgGameTime =
    data.matchHistory.length > 0
      ? Math.round(
          data.matchHistory.reduce((sum, m) => sum + m.matchStats.timeDuration, 0) /
            data.matchHistory.length /
            1000
        )
      : 0;

  const longestRally = data.matchHistory.reduce(
    (max, m) => Math.max(max, m.matchStats.longestRallyHits),
    0
  );

  (document.getElementById("stat-username") as HTMLElement).textContent = data.username;
  (document.getElementById("stat-total") as HTMLElement).textContent = String(totalGames);
  (document.getElementById("stat-wins") as HTMLElement).textContent = String(data.wins);
  (document.getElementById("stat-losses") as HTMLElement).textContent = String(data.losses);
  (document.getElementById("stat-winrate") as HTMLElement).textContent = `${winRate}%`;
  (document.getElementById("stat-avg-time") as HTMLElement).textContent = `${avgGameTime}s`;
  (document.getElementById("stat-longest-rally") as HTMLElement).textContent = String(longestRally);
}

function renderHistory(data: MatchStatsResponse) {
  const container = document.getElementById("match-history")!;
  container.innerHTML = "";

  for (const match of data.matchHistory.slice(0, 10)) {
    const li = document.createElement("li");
    li.className = "match-item";
    li.innerHTML = `
      <div class="flex justify-between text-sm">
        <span>${match.player1Username} vs ${match.player2Username}</span>
        <span class="font-semibold">${match.player1Score} - ${match.player2Score}</span>
      </div>
      <div class="text-xs text-gray-400">
        Mode: ${match.matchSettings.gameMode} | Hits: ${match.matchStats.totalHits}
      </div>
    `;
    container.appendChild(li);
  }
}

export async function initStatsView() {
  // 1. Get the logged-in account
  const response = await fetch(API_BASE_URL + "/users/me", {
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });
  if (!response.ok) {
    console.error("Failed to load account info:", response.statusText);
    return;
  }
  const accountData = await response.json();
  const accountUsername = accountData.username;

  // 2. Fetch base stats (all matches of account)
  let data = await fetchStats(accountUsername);
  if (!data) return;
  renderSummary(data);
  renderHistory(data);

  // 3. Populate guest dropdown with this account's guests
  const gm = new GuestsManager();
  await gm.fetchGuests();

  const select = document.getElementById("guest-select") as HTMLSelectElement;
  if (select) {
    select.innerHTML = `<option value="all">All</option>`;
    gm.guests.forEach((guest) => {
      const opt = document.createElement("option");
      opt.value = guest.pseudo;
      opt.textContent = guest.pseudo;
      select.appendChild(opt);
    });

    // 4. Refetch stats when guest is selected
    select.addEventListener("change", async () => {
      const guest = select.value === "all" ? undefined : select.value;
      const filtered = await fetchStats(accountUsername, guest);
      if (!filtered) return;
      renderSummary(filtered);
      renderHistory(filtered);
    });
  }
}
