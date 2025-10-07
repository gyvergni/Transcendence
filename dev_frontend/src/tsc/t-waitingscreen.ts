// t-waitingscreen.ts
import { animateContentBoxIn, animateContentBoxOut } from "./animations";
import { setContentView } from "./views";
import { MatchSetup, TournamentManager } from "./models";
import { setGameView } from "./views";
import { setLang, currentLang } from "./translation";

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
            if (tournament.firstRound[0]?.winner?.name && prevWinner)
                prevWinner.textContent = tournament.firstRound[0].winner!.name;
            else
                prevWinner!.textContent = "AI";

            if (tournament.firstRound[1].players[0].name && leftplayer)
                leftplayer.textContent = tournament.firstRound[1].players[0].name;
            else
                leftplayer!.textContent = "AI";

            if (tournament.firstRound[1].players[1].name && rightplayer)
                rightplayer.textContent = tournament.firstRound[1].players[1].name;
            else
                rightplayer!.textContent = "AI";
        }
        else
        {
            if (tournament.firstRound[1].winner?.name && prevWinner)
                prevWinner.textContent = tournament.firstRound[1].winner!.name;
            else
                prevWinner!.textContent = "AI";

            if ( tournament.final?.players[0].name && leftplayer)
                leftplayer.textContent =  tournament.final!.players[0].name;
            else
                leftplayer!.textContent = "AI";

            if (tournament.final?.players[1].name && rightplayer)
                rightplayer.textContent = tournament.final!.players[1].name;
            else
                rightplayer!.textContent = "AI";
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
        if (tournament.final?.winner?.name && champion)
            champion.textContent = tournament.final.winner.name;
        else
            champion!.textContent = "AI";
        setLang(currentLang);
        homeBtn.addEventListener("click", () => {
            setContentView("views/home.html");
            resolve();
        }, { once: true }); // once = auto-remove listener after click
    });
}

export async function setupGameEndScreen(match: MatchSetup): Promise<void> {
    animateContentBoxIn();
    await setContentView("views/game-end.html");
    console.log("In game end screen setup");
    return new Promise<void>((resolve) => {
        const homeBtn = document.getElementById("home-btn");
        if (!homeBtn) {
            console.error("Home button not found in game end screen");
            resolve(); // fallback: don't block
            return;
        }
        let winner = document.getElementById("winner-name");
        if (match.winner?.name && winner)
            winner.textContent = match.winner.name;
        else
            winner!.textContent = "AI";
        setLang(currentLang);
        homeBtn.addEventListener("click", () => {
            setContentView("views/home.html");
            resolve();
        }, { once: true }); // once = auto-remove listener after click
    });
}
