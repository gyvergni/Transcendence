import { API_BASE_URL } from "./utils-api";
import { GuestsManager } from "../models";
import { setContentView } from "../views";
import Chart from "chart.js/auto";
import { getApiErrorText } from "./utils-api.js";

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
            timeOrder: number[];
            wallBounce1: number;
            wallBounce2: number;
        };
    }[];
};

// -------------------- API --------------------
async function fetchStats(accountUsername: string, guest?: string): Promise<MatchStatsResponse | null> {
    try {
        const url = new URL(`${API_BASE_URL}/stats/${encodeURIComponent(accountUsername)}`);
        if (guest)
            url.searchParams.set("guest", guest);

        const res = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });

        if (!res.ok) {
            try { console.error("Failed to fetch stats:", getApiErrorText(await res.json())); } catch {}
            throw new Error(`HTTP ${res.status}`);
        }
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

function handleMatchDetail(match: MatchStatsResponse["matchHistory"][0]) {
  const modal = document.getElementById("match-detail")!;
  modal.style.display = "flex";

  const title = document.getElementById("match-title")!;
  title.textContent = `${match.player1Username} vs ${match.player2Username}`;

  document.getElementById("close-match-detail")!.onclick = () => {
    modal.style.display = "none";
    setContentView("../views/stats-dashboard.html");
  };

  // SETTINGS RECAP
  const s = match.matchSettings;
  const settingsUl = document.querySelector("#match-settings ul")!;
  settingsUl.innerHTML = `
    <li>Ball Size: ${s.ballSize}</li>
    <li>Ball Speed: ${s.ballSpeed}</li>
    <li>Paddle Size: ${s.paddleSize}</li>
    <li>Paddle Speed: ${s.paddleSpeed}</li>
    <li>Mode: ${s.gameMode}</li>
  `;

  // STATS RECAP
  const ms = match.matchStats;
  const statsUl = document.querySelector("#match-stats-summary ul")!;
  statsUl.innerHTML = `
    <li>Total Hits: ${ms.totalHits}</li>
    <li>Longest Rally Hits: ${ms.longestRallyHits}</li>
    <li>Longest Rally Time: ${Math.round(ms.longestRallyTime / 1000)}s</li>
    <li>Wall Bounce P1: ${ms.wallBounce1}</li>
    <li>Wall Bounce P2: ${ms.wallBounce2}</li>
  `;

  // PLAYER TABLE
  const tbody = document.getElementById("match-players-body")!;
  tbody.innerHTML = "";
  const players = [
    { name: match.player1Username, score: match.player1Score, stats: ms },
    { name: match.player2Username, score: match.player2Score, stats: ms }
  ];

  players.forEach(p => {
    const tr = document.createElement("tr");
    tr.className = "match-player-row border-b border-cyan-400/20";
    tr.innerHTML = `
      <td class="px-3 py-2">${p.name}</td>
      <td class="px-3 py-2 font-semibold">${p.score}</td>
      <td class="px-3 py-2">${p.stats.totalHits}</td>
      <td class="px-3 py-2">${p.stats.longestRallyHits}</td>
      <td class="px-3 py-2">${Math.round(p.stats.timeDuration / 1000)}</td>
    `;
    tbody.appendChild(tr);
  });

  // TIMELINE CHART
  const canvas = document.getElementById("match-points-timeline") as HTMLCanvasElement;
  if ((canvas as any)._chart) (canvas as any)._chart.destroy();

  const labels = ms.pointsOrder.map((_, i) => `P${i + 1}`);
  const durations = ms.timeOrder.map(t => t / 1000);
  const colors = ms.pointsOrder.map(winner => winner === "1" ? "#06b6d4" : "#0891b2");

  (canvas as any)._chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Rally Duration (s)",
        data: durations,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: "Points" }, ticks: { color: "#a5f3fc" } },
        y: { beginAtZero: true, title: { display: true, text: "Seconds" }, ticks: { color: "#a5f3fc" } }
      }
    }
  });
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

        li.addEventListener("click", async () =>
        {
            console.log("clicked on match");
            await setContentView("../views/match-detail.html");
            handleMatchDetail(m);
        })
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
    if (!stats)
        return;

    renderSummary(stats);
    renderHistory(stats.matchHistory);

    // Update matchup chart if right-hand guest is selected
    const opponent = matchupSelect.value;
    if (opponent)
        renderMatchupChart(guest || accountUsername, opponent, stats.matchHistory);
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
    const accountIngame = accountData.game_username;

    const gm = new GuestsManager();
    await gm.fetchGuests();
    let guestList = gm.guests.map(g => g.pseudo);

    const mainSelect = document.getElementById("main-user-select") as HTMLSelectElement;
    const matchupSelect = document.getElementById("guest-select") as HTMLSelectElement;

    populateDropdown(mainSelect, guestList, `${accountIngame} (Default)`);
    guestList.push(accountIngame);
    populateDropdown(matchupSelect, guestList , `Select Player`);

    let currentMainGuest = "";

    mainSelect.addEventListener("change", async () => {
    currentMainGuest = mainSelect.value;
    console.log("Main selected:", currentMainGuest);

    //If the selected guest is the main in-game username, treat it as the base account (no guest param)
    const guestParam = currentMainGuest === accountIngame || currentMainGuest === "" 
        ? undefined 
        : currentMainGuest;

    await handleMainGuestChange(accountUsername, guestParam, matchupSelect);
});


    matchupSelect.addEventListener("change", async () =>
    {
        const guest = currentMainGuest || accountUsername;
        const stats = await fetchStats(accountUsername, currentMainGuest || undefined);
        if (!stats)
            return;
        const opponent = matchupSelect.value;
        if (!opponent)
            return;

        // If the opponent selected is the main in-game username, treat it like the base account (no guest param).
        const opponentFetchName = opponent === accountIngame ? accountUsername : opponent;

        renderMatchupChart(currentMainGuest || accountIngame, opponent, stats.matchHistory);
    });


    // Initial load
    await handleMainGuestChange(accountUsername, undefined, matchupSelect);
}
