// t-waitingscreen.ts
import { animateContentBoxIn, animateContentBoxOut } from "./animations";
import { setContentView } from "./views";
import { MatchSetup, TournamentManager } from "./models";
import { setGameView } from "./views";
import { setLang, currentLang, translateName } from "./translation";

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
                prevWinner.textContent = translateName(tournament.firstRound[0].winner!.name);

            if (tournament.firstRound[1].players[0].name && leftplayer)
                leftplayer.textContent = translateName(tournament.firstRound[1].players[0].name);

            if (tournament.firstRound[1].players[1].name && rightplayer)
                rightplayer.textContent = translateName(tournament.firstRound[1].players[1].name);
        }
        else
        {
            if (tournament.firstRound[1].winner?.name && prevWinner)
                prevWinner.textContent = translateName(tournament.firstRound[1].winner!.name);

            if ( tournament.final?.players[0].name && leftplayer)
                leftplayer.textContent =  translateName(tournament.final!.players[0].name);

            if (tournament.final?.players[1].name && rightplayer)
                rightplayer.textContent = translateName(tournament.final!.players[1].name);
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
            champion.textContent = translateName(tournament.final.winner.name);
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
            winner.textContent = translateName(match.winner.name);
        setLang(currentLang);
        homeBtn.addEventListener("click", () => {
            setContentView("views/home.html");
            resolve();
        }, { once: true }); // once = auto-remove listener after click
    });
}
