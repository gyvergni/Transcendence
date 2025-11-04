import { getTranslatedKey, translateName } from '../utils/translation.js';
import Chart from 'chart.js/auto';
import { DashboardContext, loadDashboard, MatchStatsResponse } from './stats.js';

export async function handleMatchDetail(match: MatchStatsResponse["matchHistory"][0] | null, info: DashboardContext | null) {
    if (match == null || info == null)
        return;
    const p1name = translateName(match.player1Username);
    const p2name = translateName(match.player2Username);
    
    // Title
    document.getElementById("match-title")!.textContent =
        `${p1name} vs ${p2name} - ${match.date}`;

    // Close button
    document.getElementById("back-btn")!.onclick = () => {
        history.back();
    }

    // SETTINGS
    const s = match.matchSettings;
    (document.getElementById("ball-size") as HTMLElement).textContent = String(s.ballSize);
    (document.getElementById("ball-speed") as HTMLElement).textContent = String(s.ballSpeed);
    (document.getElementById("paddle-size") as HTMLElement).textContent = String(s.paddleSize);
    (document.getElementById("paddle-speed") as HTMLElement).textContent = String(s.paddleSpeed);
    (document.getElementById("game-mode") as HTMLElement).textContent = getTranslatedKey("stats." + s.gameMode);

    // MATCH STATS
    const ms = match.matchStats;
    (document.getElementById("total-hits") as HTMLElement).textContent = String(ms.totalHits);
    (document.getElementById("longest-rally") as HTMLElement).textContent = String(ms.longestRallyHits);
    (document.getElementById("total-time") as HTMLElement).textContent = `${Math.round(ms.timeDuration / 1000)}s`;

    // PLAYERS ROWS
    (document.getElementById("player1.name") as HTMLElement).textContent = translateName(match.player1Username);
    (document.getElementById("player1.score") as HTMLElement).textContent = String(match.player1Score);
    (document.getElementById("player1.wallbounces") as HTMLElement).textContent = String(match.matchStats.wallBounce1);
    (document.getElementById("player1.inputs") as HTMLElement).textContent = String(match.matchStats.totalInputs1);
    
    (document.getElementById("player2.name") as HTMLElement).textContent = translateName(match.player2Username);
    (document.getElementById("player2.score") as HTMLElement).textContent = String(match.player2Score);
    (document.getElementById("player2.wallbounces") as HTMLElement).textContent = String(match.matchStats.wallBounce2);
    (document.getElementById("player2.inputs") as HTMLElement).textContent = String(match.matchStats.totalInputs2);
    
    // TIMELINE CHART
    const canvas = document.getElementById("match-points-timeline") as HTMLCanvasElement;
    if ((canvas as any)._chart) (canvas as any)._chart.destroy();

    const pointsOrderSplit = ms.pointsOrder.split("");
    const labels = pointsOrderSplit.map((winner, i) => winner === "1" ? i + 1 + ": " + translateName(match.player1Username) : i  + 1 + ": " +  translateName(match.player2Username));
    const colors = pointsOrderSplit.map(winner => winner === "1" ? "#7df9ff" :"rgb(236, 154, 250)");

    const timeOrderSplit = ms.timeOrder.split(",");
    const durations = timeOrderSplit.map(t => +t / 1000);
    let ctx: any;

    (canvas as any)._chart = new Chart(canvas, {
    type: "bar",
    data: {
        labels,
        datasets: [{
            label: getTranslatedKey("match.timeline-ylabel"),
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
                color: "#ffffffff",
                font: { size: 14, weight: "bold" }
            },
        },
        scales: {
            x: {
                title: { display: true, text: getTranslatedKey("match.timeline-xlabel"), color: "#ffffffff", font: { weight: "bold", size: 14 },},
                ticks: { color: (ctx) => {
                        const index = ctx.index;
                        return pointsOrderSplit[index] === "1" ? "#7df9ff" :"rgb(236, 154, 250)";
                    },
                    callback: (value, index) => {
                        return labels[index]; // Show player name directly
                    },
                    font: { size: 14 },
                },
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: getTranslatedKey("match.timeline-ylabel"), color: "#ffffffff",
                    font: { weight: "bold", size: 12 },
                },
                ticks: { color: "#ffffffff",
                    font: { weight: "bold", size: 12 },
                },
                grid: { color: "rgba(165,243,252,0.2)" },
                
            },
        },
    },
    });
    
}