// t-waitingscreen.ts
import { animateContentBoxIn, animateContentBoxOut } from "./animations";
import { setContentView, setupPause } from "./viewHandler";
import { MatchSetup, TournamentManager } from "../utils/models";
import { setGameView } from "./viewHandler";
import { setLang, currentLang, translateName } from "../utils/translation";
import uiManager from "../main";

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

export function pause(match: MatchSetup, e: KeyboardEvent) {
    console.log("game = ", match.game);
    console.log("IS ANIMATING= %d", uiManager.getIsAnimating());
    if (e.key === "Escape" && uiManager.getIsAnimating() === false && match.game != null) {
        console.log("2: %d", uiManager.getIsAnimating());
        uiManager.setIsAnimating(true);
        if (uiManager.getCurrentView().includes("pause"))
        {
            if (match.game != null && match.game.pause == true)
                match.game.pause = false;
            match.game.clock.resumeTimer();
            animateContentBoxOut();
            console.log("apres 1");
            setGameView();
            console.log("3: %d", uiManager.getIsAnimating());
        }
        else if (uiManager.getCurrentView().includes("game"))
        {
            if (match.game != null && match.game.pause == false) {
                match.game.pause = true;
            }
            match.game.clock.pauseTimer();
            animateContentBoxIn();
            console.log("apres 2");
            setupPause(match);
            console.log("4: %d", uiManager.getIsAnimating());
        };
    }
}