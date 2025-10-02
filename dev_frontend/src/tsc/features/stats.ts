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

// -------------------- API --------------------
async function fetchStats(accountUsername: string, guest?: string): Promise<MatchStatsResponse | null> {
  try {
    const url = new URL(`${API_BASE_URL}/stats/${encodeURIComponent(accountUsername)}`);
    if (guest) url.searchParams.set("guest", guest);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as MatchStatsResponse;
  } catch (err) {
    console.error("Failed to fetch stats", err);
    return null;
  }
}

// -------------------- RENDERERS --------------------
function renderSummary(data: MatchStatsResponse) {
  const totalGames = data.wins + data.losses;
  const winRate = totalGames > 0 ? Math.round((data.wins / totalGames) * 100) : 0;

  const summaryMap = {
    "#stat-total": totalGames,
    "#stat-wins": data.wins,
    "#stat-losses": data.losses,
    "#stat-winrate": `${winRate}%`,
    "#stat-toptime": `${Math.round(data.matchHistory.reduce((sum, m) => sum + m.matchStats.timeDuration, 0) / (data.matchHistory.length || 1) / 1000)}s`,
    "#stat-bounces": data.matchHistory.reduce((max, m) => Math.max(max, m.matchStats.longestRallyHits), 0)
  };

  for (const selector in summaryMap) {
    const el = document.querySelector(selector);
    if (el) el.textContent = String(summaryMap[selector as keyof typeof summaryMap]);
  }
}

function renderHistory(matchHistory: MatchStatsResponse["matchHistory"]) {
  const container = document.getElementById("match-history")!;
  container.innerHTML = "";

  matchHistory.slice(0, 10).forEach(m => {
    const li = document.createElement("li");
    li.className = "match-item";
    li.innerHTML = `
      <div class="flex justify-between text-sm">
        <span>${m.player1Username} vs ${m.player2Username}</span>
        <span class="font-semibold">${m.player1Score} - ${m.player2Score}</span>
      </div>
      <div class="text-xs text-gray-400">
        Mode: ${m.matchSettings.gameMode} | Hits: ${m.matchStats.totalHits}
      </div>
    `;
    container.appendChild(li);
  });
}

function renderMatchupChart(mainGuest: string, opponentGuest: string, matchHistory: MatchStatsResponse["matchHistory"]) {
  const canvas = document.getElementById("guests-bar") as HTMLCanvasElement;
  if (!canvas) return;

  const matches = matchHistory.filter(m =>
    (m.player1Username === mainGuest && m.player2Username === opponentGuest) ||
    (m.player1Username === opponentGuest && m.player2Username === mainGuest)
  );

  const wins = matches.filter(m =>
    (m.player1Username === mainGuest && m.player1Score > m.player2Score) ||
    (m.player2Username === mainGuest && m.player2Score > m.player1Score)
  ).length;
  const losses = matches.length - wins;

  if ((canvas as any)._chart) (canvas as any)._chart.destroy();

  (canvas as any)._chart = new (window as any).Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Wins", "Losses"],
      datasets: [{
        label: `${mainGuest} vs ${opponentGuest}`,
        data: [wins, losses],
        backgroundColor: ["#22c55e", "#ef4444"]
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, precision: 0 } } }
  });
}

// -------------------- DROPDOWN HANDLERS --------------------
async function handleMainGuestChange(accountUsername: string, guest: string | undefined, matchupSelect: HTMLSelectElement) {
  const stats = await fetchStats(accountUsername, guest);
  if (!stats) return;

  renderSummary(stats);
  renderHistory(stats.matchHistory);

  // Update matchup chart if right-hand guest is selected
  const opponent = matchupSelect.value;
  if (opponent) renderMatchupChart(guest || accountUsername, opponent, stats.matchHistory);
}

function populateDropdown(select: HTMLSelectElement, options: string[], defaultText: string) {
  select.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = defaultText;
  select.appendChild(defaultOption);

  options.forEach(optText => {
    const opt = document.createElement("option");
    opt.value = optText;
    opt.textContent = optText;
    select.appendChild(opt);
  });
}

// -------------------- INIT --------------------
export async function initStatsView() {
  const accountRes = await fetch(`${API_BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } });
  if (!accountRes.ok) return console.error("Failed to get account info");
  const accountData = await accountRes.json();
  const accountUsername = accountData.pseudo;

  const gm = new GuestsManager();
  await gm.fetchGuests();
  const guestList = gm.guests.map(g => g.pseudo);

  const mainSelect = document.getElementById("main-user-select") as HTMLSelectElement;
  const matchupSelect = document.getElementById("guest-select") as HTMLSelectElement;

  populateDropdown(mainSelect, guestList, `${accountUsername} (default)`);
  populateDropdown(matchupSelect, guestList, "Select guest");

  let currentMainGuest = "";

  mainSelect.addEventListener("change", async () => {
    currentMainGuest = mainSelect.value;
    await handleMainGuestChange(accountUsername, currentMainGuest || undefined, matchupSelect);
  });

  matchupSelect.addEventListener("change", async () => {
    const guest = currentMainGuest || accountUsername;
    const stats = await fetchStats(accountUsername, currentMainGuest || undefined);
    if (!stats) return;
    if (!matchupSelect.value) return;

    renderMatchupChart(currentMainGuest || accountUsername, matchupSelect.value, stats.matchHistory);
  });

  // Initial load
  await handleMainGuestChange(accountUsername, undefined, matchupSelect);
}
