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
            totalInputs1: number;
            totalInputs2: number;
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
function renderSummary(data: MatchStatsResponse, currentMainGuest: string) {
    const totalGames = data.wins + data.losses;
    const winRate = totalGames > 0 ? Math.round((data.wins / totalGames) * 100) : 0;
    let totalInputs = 0;
    for (const match of data.matchHistory)
    {
        if (match.player1Username == currentMainGuest)
            totalInputs += match.matchStats.totalInputs1;
        else if (match.player2Username == currentMainGuest)
            totalInputs += match.matchStats.totalInputs2;
    }
    const summaryMap = {
        "#stat-total": totalGames,
        "#stat-wins": data.wins,
        "#stat-losses": data.losses,
        "#stat-winrate": `${winRate}%`,
        "#stat-inputs": totalInputs,
        "#stat-bounces": data.matchHistory.reduce((max, m) => Math.max(max, m.matchStats.longestRallyHits), 0)
    };

    for (const selector in summaryMap) {
        const el = document.querySelector(selector);
        if (el) el.textContent = String(summaryMap[selector as keyof typeof summaryMap]);
    }
}

function renderGameAverages(data: MatchStatsResponse) {
    const totalMatches = data.matchHistory.length;
    if (totalMatches === 0) {
        document.getElementById("avg-inputs")!.textContent = "—";
        document.getElementById("avg-length")!.textContent = "—";
        document.getElementById("avg-wallBounces")!.textContent = "—";
        return;
    }

    let totalInputs = 0;
    let totalLength = 0;
    let totalWallBounces = 0;

    for (const match of data.matchHistory) {
        totalInputs += (match.matchStats.totalInputs1 || 0) + (match.matchStats.totalInputs2 || 0);
        totalLength += match.matchStats.timeDuration || 0;
        totalWallBounces += match.matchStats.longestRallyHits || 0;
    }

    const avgInputs = Math.round(totalInputs / totalMatches);
    const avgLengthSeconds = Math.round((totalLength / totalMatches) / 1000);
    const avgWallBounces = Math.round(totalWallBounces / totalMatches);

    document.getElementById("avg-inputs")!.textContent = String(avgInputs);
    document.getElementById("avg-length")!.textContent = `${avgLengthSeconds}s`;
    document.getElementById("avg-wallBounces")!.textContent = String(avgWallBounces);
}


export function handleMatchDetail(match: MatchStatsResponse["matchHistory"][0]) {
  const modal = document.getElementById("match-detail")!;
  modal.style.display = "flex";

  // Title
  document.getElementById("match-title")!.textContent =
    `${match.player1Username} vs ${match.player2Username}`;

  // Close button
  document.getElementById("close-match-detail")!.onclick = () => {
    modal.style.display = "none";
    setContentView("../views/stats-dashboard.html");
  };

  // ---------------- SETTINGS ----------------
  const s = match.matchSettings;
  (document.getElementById("ball-size") as HTMLElement).textContent = String(s.ballSize);
  (document.getElementById("ball-speed") as HTMLElement).textContent = String(s.ballSpeed);
  (document.getElementById("paddle-size") as HTMLElement).textContent = String(s.paddleSize);
  (document.getElementById("paddle-speed") as HTMLElement).textContent = String(s.paddleSpeed);
  (document.getElementById("game-mode") as HTMLElement).textContent = s.gameMode;

  // ---------------- MATCH STATS ----------------
  const ms = match.matchStats;
  (document.getElementById("total-hits") as HTMLElement).textContent = String(ms.totalHits);
  (document.getElementById("longest-rally-hits") as HTMLElement).textContent = String(ms.longestRallyHits);
  (document.getElementById("longest-rally-time") as HTMLElement).textContent = `${Math.round(ms.longestRallyTime / 1000)}s`;
  (document.getElementById("wall-bounce-p1") as HTMLElement).textContent = String(ms.wallBounce1 ?? 0);
  (document.getElementById("wall-bounce-p2") as HTMLElement).textContent = String(ms.wallBounce2 ?? 0);

  // ---------------- PLAYER ROWS ----------------
  (document.getElementById("player1-name") as HTMLElement).textContent = match.player1Username;
  (document.getElementById("player1-score") as HTMLElement).textContent = String(match.player1Score);
  (document.getElementById("player1-hits") as HTMLElement).textContent = String(ms.totalHits);
  (document.getElementById("player1-rally") as HTMLElement).textContent = String(ms.longestRallyHits);
  (document.getElementById("player1-duration") as HTMLElement).textContent = `${Math.round(ms.timeDuration / 1000)}`;

  (document.getElementById("player2-name") as HTMLElement).textContent = match.player2Username;
  (document.getElementById("player2-score") as HTMLElement).textContent = String(match.player2Score);
  (document.getElementById("player2-hits") as HTMLElement).textContent = String(ms.totalHits);
  (document.getElementById("player2-rally") as HTMLElement).textContent = String(ms.longestRallyHits);
  (document.getElementById("player2-duration") as HTMLElement).textContent = `${Math.round(ms.timeDuration / 1000)}`;

  // ---------------- TIMELINE CHART ----------------
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
async function handleMainGuestChange(accountUsername: string, currentMainGuest: string | undefined, matchupSelect: HTMLSelectElement) {
    const stats = await fetchStats(accountUsername, currentMainGuest);
    if (!stats)
        return;
    renderSummary(stats, currentMainGuest!);
    renderHistory(stats.matchHistory);
    renderGameAverages(stats);

    // Update matchup chart if right-hand guest is selected
    const opponent = matchupSelect.value;
    if (opponent)
        renderMatchupChart(currentMainGuest || accountUsername, opponent, stats.matchHistory);
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
