// t-waitingscreen.ts
import { animateContentBoxIn, animateContentBoxOut } from "./animations";
import { setContentView } from "./views";
import { TournamentManager } from "./models";
import { setGameView } from "./views";

export async function setupTournamentWaitingRoom(tournament: TournamentManager): Promise<void> {
    animateContentBoxIn();
    await setContentView("views/t-waitingscreen.html");
    console.log("In waiting screen setup");
    return new Promise<void>((resolve) => {
        const resumeBtn = document.getElementById("ready-btn");
        if (!resumeBtn) {
            console.error("Ready button not found in waiting screen");
            resolve(); // fallback: don't block
            return;
        }
        let prevWinner = document.getElementById("prev-winner");
        let leftplayer = document.getElementById("leftplayer");
        let rightplayer = document.getElementById("rightplayer");

        if (tournament.firstRound[1].winner == null)
        {
            prevWinner!.textContent = tournament.firstRound[0].winner!.name;
            leftplayer!.textContent = tournament.firstRound[1].players[0].name;
            rightplayer!.textContent = tournament.firstRound[1].players[1].name;
        }
        else
        {
            prevWinner!.textContent = tournament.firstRound[1].winner!.name;
            leftplayer!.textContent = tournament.final!.players[0].name;
            rightplayer!.textContent = tournament.final!.players[1].name;
        }
        resumeBtn.addEventListener("click", () => {
        setGameView();
        resolve();
        }, { once: true }); // once = auto-remove listener after click
    });
}

export async function setupTournamentEndScreen(tournament: TournamentManager): Promise<void> {
    animateContentBoxIn();
    await setContentView("views/tournament-end.html");
    console.log("In tournament end screen setup");
    return new Promise<void>((resolve) => {
        const homeBtn = document.getElementById("home-btn");
        if (!homeBtn) {
            console.error("Home button not found in tournament end screen");
            resolve(); // fallback: don't block
            return;
        }
        let champion = document.getElementById("champion-name");
        champion!.textContent = tournament.final!.winner!.name;

        homeBtn.addEventListener("click", () => {
            setContentView("views/home.html");
            resolve();
        }, { once: true }); // once = auto-remove listener after click
    });
}