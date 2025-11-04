import { API_BASE_URL } from "../utils/utilsApi";
import { GuestsManager } from "../utils/models";
import { setContentView } from "../display/viewHandler";
import Chart from "chart.js/auto";
import { getApiErrorText } from "../utils/utilsApi.js";
import { toggleBackButton } from "../display/animations";
import uiManager from "../main";
import {getTranslatedKey, translateName} from "../utils/translation";
import { handleMatchDetail } from "./match";

export type MatchStatsResponse = {
    id: number;
    username: string;
    wins: number;
    losses: number;
    matchHistory: {
        id: number;
        date: Date;
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

export type DashboardContext = {
    accountPseudo: string;
    accountIngame: string;
    currentMainGuest: string;
    friendPseudo: string | null;
    selectedMatchup: string | null;
};

// -------------------- API --------------------
async function fetchStats(info: DashboardContext): Promise<MatchStatsResponse | null> {
    try {
        const url = new URL(`${API_BASE_URL}/stats/${encodeURIComponent(info.accountPseudo)}`);
        if (info.currentMainGuest != info.accountIngame)
            url.searchParams.set("guest", info.currentMainGuest);

        const res = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        return await res.json() as MatchStatsResponse;
    } catch (err) {
        console.error("Failed to fetch stats", err);
        return null;
    }
}

// -------------------- RENDERERS --------------------
function renderSummary(data: MatchStatsResponse, info: DashboardContext) {
    const totalGames = data.wins + data.losses;
    const winRate = totalGames > 0 ? Math.round((data.wins / totalGames) * 100) : 0;
    let totalInputs = 0;
    for (const match of data.matchHistory)
    {
        if (match.player1Username == info.currentMainGuest)
            totalInputs += match.matchStats.totalInputs1;
        else if (match.player2Username == info.currentMainGuest)
            totalInputs += match.matchStats.totalInputs2;
    }
    const summaryMap = {
        "#stat-total": totalGames,
        "#stat-wins": data.wins,
        "#stat-losses": data.losses,
        "#stat-winrate": `${winRate}%`,
        "#stat-inputs": totalInputs,
        "#stat-longestrally": data.matchHistory.reduce((max, m) => Math.max(max, m.matchStats.longestRallyHits), 0)
    };

    for (const selector in summaryMap) {
        const el = document.querySelector(selector);
        if (el) el.textContent = String(summaryMap[selector as keyof typeof summaryMap]);
    }
}

function renderGameStats(data: MatchStatsResponse, info: DashboardContext) {
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
    let totalHits = 0;
    let totalPointsWon = 0;
    let totalPointsLost = 0;
    let totalTournaments = 0;
    let tournamentFinals = 0;
    let tournamentsWon = 0;

    for (const match of data.matchHistory) {
        totalInputs += match.player1Username == info.currentMainGuest? (match.matchStats.totalInputs1) : (match.matchStats.totalInputs2);
        totalLength += match.matchStats.timeDuration || 0;
        totalWallBounces += match.matchStats.longestRallyHits || 0;
        totalHits += match.matchStats.totalHits / 2;
        totalPointsWon += match.player1Username == info.currentMainGuest? match.player1Score : match.player2Score;
        totalPointsLost += match.player1Username == info.currentMainGuest? match.player2Score : match.player1Score;
        totalTournaments += match.matchSettings.gameMode.includes("t-first") ? 1 : 0;
        tournamentFinals += match.matchSettings.gameMode === "t-final" ? 1 : 0;
        tournamentsWon += (match.matchSettings.gameMode === "t-final" && ((match.player1Username == info.currentMainGuest && match.player1Score > match.player2Score) || (match.player2Username == info.currentMainGuest && match.player2Score > match.player1Score))) ? 1 : 0;
    }

    const avgInputs = Math.round(totalInputs / totalMatches);
    const avgLengthSeconds = Math.round((totalLength / totalMatches) / 1000);
    const avgWallBounces = Math.round(totalWallBounces / totalMatches);

    //Game averages
    document.getElementById("avg-inputs")!.textContent = String(avgInputs);
    document.getElementById("avg-length")!.textContent = `${avgLengthSeconds}s`;
    document.getElementById("avg-wallBounces")!.textContent = String(avgWallBounces);
    
    //General Stats
    const totalTimeSeconds = Math.round(totalLength / 1000);
    if (totalTimeSeconds < 60)
        document.getElementById("total-time")!.textContent = String(Math.round(totalLength/1000)) + "s";
    else if (totalTimeSeconds < 3600)
        document.getElementById("total-time")!.textContent = String(Math.floor(totalTimeSeconds/60)) + "m " + String(totalTimeSeconds%60) + "s";

    document.getElementById("total-inputs")!.textContent = String(totalInputs);
    document.getElementById("total-wallBounces")!.textContent = String(totalWallBounces);
    document.getElementById("total-hits")!.textContent = String(totalHits);
    document.getElementById("tournaments-played")!.textContent = String(totalTournaments);
    document.getElementById("tournaments-finals")!.textContent = String(tournamentFinals);
    document.getElementById("tournaments-won")!.textContent = String(tournamentsWon);
}

function renderHistory(matchHistory: MatchStatsResponse["matchHistory"], info: DashboardContext) {
    const container = document.getElementById("match-history")!;
    container.innerHTML = "";

    matchHistory.forEach(m => {
        const won =
            (m.player1Username === info.currentMainGuest && m.player1Score > m.player2Score) ||
            (m.player2Username === info.currentMainGuest && m.player2Score > m.player1Score);

        const borderColor = won ? "border-green-500" : "border-red-500";
        const hoverColor = won ? "hover:bg-green-500/30" : "hover:bg-red-500/30";

        const li = document.createElement("li");
        li.className = `
            match-item
            bg-black/30 ${hoverColor}
            border-l-4 ${borderColor}
            rounded-lg p-3 mb-2
            cursor-pointer transition-colors
        `;

        const topLine = document.createElement("div");
        topLine.className = "flex justify-between text-sm font-medium text-white";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = `${translateName(m.player1Username)} vs ${translateName(m.player2Username)}`;

        const scoreSpan = document.createElement("span");
        scoreSpan.className = "font-semibold";
        scoreSpan.textContent = `${m.player1Score} - ${m.player2Score}`;

        topLine.append(nameSpan, scoreSpan);

        const bottomLine = document.createElement("div");
        bottomLine.className = "text-xs text-gray-300 mt-1";

        bottomLine.textContent = `${getTranslatedKey("stats.mode")}: ${getTranslatedKey("stats." + m.matchSettings.gameMode)} | ${m.date}`;

        li.addEventListener("click", async () => {
            uiManager.setMatchDetail(m, info);
            await setContentView("../views/match-detail.html");
        });

        li.append(topLine, bottomLine);
        container.appendChild(li);
    });
}


function renderMatchupChart(info: DashboardContext, opponentGuest: string, matchHistory: MatchStatsResponse["matchHistory"]) {
    const canvas = document.getElementById("guests-bar") as HTMLCanvasElement;
    if (!canvas) return;

    const matches = matchHistory.filter(m =>
        (m.player1Username === info.currentMainGuest && m.player2Username === opponentGuest) ||
        (m.player1Username === opponentGuest && m.player2Username === info.currentMainGuest)
    );

    const wins = matches.filter(m =>
        (m.player1Username === info.currentMainGuest && m.player1Score > m.player2Score) ||
        (m.player2Username === info.currentMainGuest && m.player2Score > m.player1Score)
    ).length;
    const losses = matches.length - wins;

    if ((canvas as any)._chart) (canvas as any)._chart.destroy();

    (canvas as any)._chart = new (window as any).Chart(canvas, {
        type: "bar",
        data: {
            labels: [getTranslatedKey("stats.wins"), getTranslatedKey("stats.losses")],
            datasets: [{
                label: `${info.currentMainGuest} vs ${opponentGuest}`,
                data: [wins, losses],
                backgroundColor: ["rgb(126, 231, 165)" ,"rgb(237, 103, 103)"],
            }]
        },
        options:
        {
            maintainAspectRatio:false,
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: "#ffffff" },
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0,
                        stepSize: 1,
                        color: "#ffffff"
                    },
                    title: { display: true, text: getTranslatedKey("stats.matchup-ylabel"), color: "#ffffffff",
                    font: {size: 12 },
                    },
                    suggestedMax: Math.max(1, wins + losses),
                },
            }
        }
    });
}


// -------------------- DROPDOWN HANDLERS --------------------
function getPlayedOpponents(matchHistory: MatchStatsResponse["matchHistory"], info: DashboardContext): string[] {
    const playedOpponents = new Set<string>();
    for (const match of matchHistory) {
        if (match.player1Username === info.currentMainGuest)
            playedOpponents.add(match.player2Username);
        else if (match.player2Username === info.currentMainGuest)
            playedOpponents.add(match.player1Username);
    }
    return Array.from(playedOpponents);
}

async function updateMatchupDropdown(info: DashboardContext, matchupSelect: HTMLSelectElement) {
    const stats = await fetchStats(info);
    
    if (!stats) return;

    // Get real opponents played against
    const opponents = getPlayedOpponents(stats.matchHistory, info);

    // Add AI options
    const options = [...opponents];

    populateDropdown(matchupSelect, options, getTranslatedKey("stats.select_matchup"));
    
    return stats;
}

export async function loadDashboard(info: DashboardContext)
{

    toggleBackButton(true, async () => {
        history.back();
    });
    const gm = new GuestsManager();
    await gm.fetchGuests(info.accountPseudo);

    const mainSelect = document.getElementById("main-user-select") as HTMLSelectElement;
    const matchupSelect = document.getElementById("guest-select") as HTMLSelectElement;

    // Populate main guest select with all guests
    populateDropdown(mainSelect, gm.guests.map(g => g.pseudo), `${info.accountIngame} ${(getTranslatedKey("stats.default"))}`);
    if (info.currentMainGuest !== info.accountIngame) {
        mainSelect.value = info.currentMainGuest;
    }
    // Initial load of matchup dropdown and stats
    await handleMainGuestChange(info, matchupSelect);

    // Main guest change handler
    mainSelect.addEventListener("change", async () => {
        info.currentMainGuest = mainSelect.value || info.accountIngame;
        await handleMainGuestChange(info, matchupSelect);
    });

    // Matchup select change handler
    matchupSelect.addEventListener("change", async () => {
        const opponent = matchupSelect.value;
        if (!opponent) return;

        const stats = await fetchStats(info);
        if (!stats) return;
        info.selectedMatchup = opponent;
        renderMatchupChart(info, opponent, stats.matchHistory);
    });
}


function resetMatchupChart() {
    const canvas = document.getElementById("guests-bar") as HTMLCanvasElement;
    if (!canvas) return;

    if ((canvas as any)._chart) {
        (canvas as any)._chart.destroy();
        (canvas as any)._chart = null;
    }
}


async function handleMainGuestChange(info: DashboardContext, matchupSelect: HTMLSelectElement) {
    const stats = await updateMatchupDropdown(info, matchupSelect);
    if (!stats)
        return;
    renderSummary(stats, info);
    renderHistory(stats.matchHistory, info);
    renderGameStats(stats, info);
    if (info.selectedMatchup) {
        matchupSelect.value = info.selectedMatchup;
        renderMatchupChart(info, info.selectedMatchup, stats.matchHistory);
    } else {
        resetMatchupChart();
    }
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
        opt.textContent = translateName(optText);
        select.appendChild(opt);
    });
}

export async function initStatsView() {
    try{
        let accountRes;
        const friendsPseudo = uiManager.getFriendsPseudo();
        if (friendsPseudo != null)
            accountRes = await fetch(`${API_BASE_URL}/users/${friendsPseudo}`, { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }); 
        else
            accountRes = await fetch(`${API_BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } });
        if (!accountRes.ok)
            return console.error("Failed to get account info");
        let accountData = await accountRes.json();
        let info: DashboardContext = {
            accountPseudo: accountData.pseudo,
            accountIngame: accountData.game_username,
            currentMainGuest: accountData.game_username,
            friendPseudo: friendsPseudo,
            selectedMatchup: null,
        }
        if (info.friendPseudo)
        {
            info.accountPseudo = accountData[0].pseudo;
            info.accountIngame = accountData[0].game_username;
            info.currentMainGuest = info.accountIngame;
        }
        loadDashboard(info);
    }
    catch (e)
    {
        console.error("Dashboard display failed", e);
        return ;
    }
}