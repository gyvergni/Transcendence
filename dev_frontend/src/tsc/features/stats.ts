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
            pointsOrder: string;
            timeOrder: string;
            wallBounce1: number;
            wallBounce2: number;
            totalInputs1: number;
            totalInputs2: number;
        };
    }[];
}; 

// -------------------- API --------------------
async function fetchStats(accountData: any, currentMainGuest: string): Promise<MatchStatsResponse | null> {
    try {
        const url = new URL(`${API_BASE_URL}/stats/${encodeURIComponent(accountData.pseudo)}`);
        if (currentMainGuest != accountData.game_username)
            url.searchParams.set("guest", currentMainGuest);

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

function renderHistory(matchHistory: MatchStatsResponse["matchHistory"], currentMainGuest: string) {
    const container = document.getElementById("match-history")!;
    container.innerHTML = "";

    matchHistory.slice(0, 10).forEach(m => {
        console.log("m.player1Username:", m.player1Username, "m.player2Username:", m.player2Username, "currentMainGuest:", currentMainGuest);
        const won = (m.player1Username === currentMainGuest && m.player1Score > m.player2Score) ||
                    (m.player2Username === currentMainGuest && m.player2Score > m.player1Score);

        const borderColor = won ? 'border-green-500' : 'border-red-500';
        const li = document.createElement("li");
        li.className = `
            match-item
            bg-black/30 hover:bg-black/50
            border-l-4 ${borderColor}
            rounded-lg p-3 mb-2
            cursor-pointer transition-colors
        `;

        li.innerHTML = `
            <div class="flex justify-between text-sm font-medium text-white">
                <span>${m.player1Username} vs ${m.player2Username}</span>
                <span class="font-semibold">${m.player1Score} - ${m.player2Score}</span>
            </div>
            <div class="text-xs text-gray-300 mt-1">
                Mode: ${m.matchSettings.gameMode} | Hits: ${m.matchStats.totalHits}
            </div>
        `;

        li.addEventListener("click", async () => {
            console.log("clicked on match");
            await setContentView("../views/match-detail.html");
            handleMatchDetail(m);
        });

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
function getPlayedOpponents(matchHistory: MatchStatsResponse["matchHistory"], mainGuest: string): string[] {
    const playedOpponents = new Set<string>();
    for (const match of matchHistory) {
        if (match.player1Username === mainGuest)
            playedOpponents.add(match.player2Username);
        else if (match.player2Username === mainGuest)
            playedOpponents.add(match.player1Username);
    }
    return Array.from(playedOpponents);
}

async function updateMatchupDropdown(accountData: any, mainGuest: string, matchupSelect: HTMLSelectElement) {
    const stats = await fetchStats(accountData, mainGuest);
    if (!stats) return;

    // Get real opponents played against
    const opponents = getPlayedOpponents(stats.matchHistory, mainGuest);

    // Add AI options
    const options = [...opponents];

    populateDropdown(matchupSelect, options, "Select Player");

    return stats;
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
    (document.getElementById("longest-rally") as HTMLElement).textContent = String(ms.longestRallyHits);
    (document.getElementById("total-time") as HTMLElement).textContent = `${Math.round(ms.timeDuration / 1000)}s`;

    // ---------------- PLAYER ROWS ----------------
    (document.getElementById("player1.name") as HTMLElement).textContent = match.player1Username;
    (document.getElementById("player1.score") as HTMLElement).textContent = String(match.player1Score);
    (document.getElementById("player1.wallbounces") as HTMLElement).textContent = String(match.matchStats.wallBounce1);
    (document.getElementById("player1.inputs") as HTMLElement).textContent = String(match.matchStats.totalInputs1);
    
    (document.getElementById("player2.name") as HTMLElement).textContent = match.player2Username;
    (document.getElementById("player2.score") as HTMLElement).textContent = String(match.player2Score);
    (document.getElementById("player2.wallbounces") as HTMLElement).textContent = String(match.matchStats.wallBounce2);
    (document.getElementById("player2.inputs") as HTMLElement).textContent = String(match.matchStats.totalInputs2);
    
    // ---------------- TIMELINE CHART ----------------
    const canvas = document.getElementById("match-points-timeline") as HTMLCanvasElement;
    if ((canvas as any)._chart) (canvas as any)._chart.destroy();

    const pointsOrderSplit = ms.pointsOrder.split(""); // ['1','2','2']
    const labels = pointsOrderSplit.map((winner, i) => winner === "1" ? i + 1 + ": " + match.player1Username : i  + 1 + ": " +  match.player2Username);
    const colors = pointsOrderSplit.map(winner => winner === "1" ? "#eb69e2ff" : "#05c9b8ff");

    const timeOrderSplit = ms.timeOrder.split(",");
    const durations = timeOrderSplit.map(t => +t / 1000);

    (canvas as any)._chart = new Chart(canvas, {
    type: "bar",
    data: {
        labels,
        datasets: [{
            label: "Rally Duration (s)",
            data: durations,
            backgroundColor: colors,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 0,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                color: "#a5f3fc",
                font: { size: 14, weight: "bold" }
            },
        },
        scales: {
            x: {
                title: { display: true, text: "Point Winner", color: "#a5f3fc" },
                ticks: { color: (ctx) => {
                        const index = ctx.index;
                        return pointsOrderSplit[index] === "1" ? "#eb69e2ff" : "#05c9b8ff";
                    },
                    callback: (value, index) => {
                        return labels[index]; // Show player name directly
                    }
                },
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: "Rally Duration (s)", color: "#a5f3fc" },
                ticks: { color: "#a5f3fc" },
                grid: { color: "rgba(165,243,252,0.2)" },
            },
        },
    },
    });
}


// -------------------- DROPDOWN HANDLERS --------------------
async function handleMainGuestChange(accountData: any , currentMainGuest: string, matchupSelect: HTMLSelectElement) {
    const stats = await updateMatchupDropdown(accountData, currentMainGuest, matchupSelect);
    if (!stats)
        return;
    renderSummary(stats, currentMainGuest!);
    renderHistory(stats.matchHistory, currentMainGuest);
    renderGameAverages(stats);

    // Update matchup chart if right-hand guest is selected
    const opponent = matchupSelect.value;
    if (opponent)
        renderMatchupChart(currentMainGuest || accountData.game_username, opponent, stats.matchHistory);
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
    const accountIngame = accountData.game_username;
    let currentMainGuest = accountIngame;

    const gm = new GuestsManager();
    await gm.fetchGuests();

    const mainSelect = document.getElementById("main-user-select") as HTMLSelectElement;
    const matchupSelect = document.getElementById("guest-select") as HTMLSelectElement;

    // Populate main guest select with all guests
    populateDropdown(mainSelect, gm.guests.map(g => g.pseudo), `${accountIngame} (Default)`);

    // Initial load of matchup dropdown and stats
    await handleMainGuestChange(accountData, currentMainGuest, matchupSelect);

    // Main guest change handler
    mainSelect.addEventListener("change", async () => {
        currentMainGuest = mainSelect.value || accountIngame;
        await handleMainGuestChange(accountData, currentMainGuest, matchupSelect);
    });

    // Matchup select change handler
    matchupSelect.addEventListener("change", async () => {
        const opponent = matchupSelect.value;
        if (!opponent) return;

        const stats = await fetchStats(accountData, currentMainGuest);
        if (!stats) return;

        renderMatchupChart(currentMainGuest, opponent, stats.matchHistory);
    });
}
