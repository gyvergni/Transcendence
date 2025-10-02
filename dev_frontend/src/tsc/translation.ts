export type Lang = "fr" | "en" | "es";

const translations: Record<Lang, Record<string, string>> = 
{
	en: {
		//home.html
		"home.menu": "Main Menu",
		"home.qmatch": "Quick Match",
		"home.tournament": "Tournament",
		"home.settings": "Settings",
		"home.profile": "Profile",

		//account.html
		"account.info": "Account info",
		"account.username.enter": "Username: ",
		"account.igusername.title": "In-game username: ",
		"account.new.igusername": "New in-game username",
		"account.change.pw" : "Modify password",
		"account.change.igusername": "Change in-game username",
		"account.oldpass": "Old password",
		"account.newpass": "New password",
		"account.conf.pass": "Confirm password",
		"account.save": "Save",
		"account.butt.2FA": "2FA",
		"account.enable": "Activate two-factor authentification",
		"account.qr.mess": "Scan this QR code with your authentification app (Google Authentificator, ...)",
		"account.validate": "Confirm",
		"account.cancel": "Cancel",
		"account.2FA.title": "Desactivation two-factor authentification",
		"account.disable2FA.message": "Enter your current password and a 2FA code to disable two-factor authentication.",
		"account.current.pass": "Current password",
		"account.otc": "One-time code",
		"account.butt.d2FA": "Disable 2FA",

		//ai-selection.html
		"ai.easy-title": "For beginners. AI moves slowly and reacts late.",
		"ai.easy-btn": "Easy",
		"ai.medium-title": "Balanced challenge. AI has average speed and intelligence.",
		"ai.medium-btn": "Medium",
		"ai.hard-title": "Expert-level AI. Fast and accurate reactions.",
		"ai.hard-btn": "Hard",
		"lockin": "Lock In",

		//login.html
		"login.login": "Login",
		"login.username": "Username",
		"login.password": "Password",
		"login.noprofile-msg": " Don't have a profile ? ",
		"login.create-acc": "Create Account",
		"login.2FA-text": "Two-Factor Authentication",
		"login.code-msg": "Enter the 6-digit code from your authenticator app",
		"login.auth-code": "Authentication Code",
		"login.verify": "Verify",
		"login.cancel": "Cancel",

		//pause.html
		"pause.title": "Pause Menu",
		"pause.resume": "Resume",
		"pause.quit": "Quit",

		//player-selection.html
		"player.select": "Select Player",
		"player.login": "Lock in",
		"player.add-guest-btn": "Add Guest",
		"player.del-guest-btn": "Delete Guest",

		//player-slot-template.html
		"player-slot.player": "Player",
		"player-slot.ai": "AI",

		//profile.html
		"profile.friends": "Friends",
		"profile.stats": "Stats",
		"profile.account": "Account",
		"profile.logout": "Log Out",

		//quick-match.html
		"quick.title": "Quick Match Setup",
		"quick.instructions": "Choose 2 players or AI",
		"quick.start": "Start Match",

		//settings.html
		"settings.paddle-size": "Paddle Size",
		"settings.paddle-color": "Paddle Color",
		"settings.paddle-speed": "Paddle Speed",
		"settings.ball-color": "Ball Color",
		"settings.ball-size": "Ball Size",
		"settings.ball-speed": "Ball Speed",
		"settings.ball-shape": "Ball Shape",
		"settings.language": "Language",

		//signup.html
		"signup.create-acc": "Create an account",
		"signup.username": "Username",
		"signup.password": "Password",
		"signup.verify-pw": "Verify Password",
		"signup.signup-btn": "Sign Up",

		//stats-dashboard.html
		"stats.statistics": "Statistics",
		"stats.totalgames": "Total Games",
		"stats.wins": "Wins",
		"stats.losses": "Losses",
		"stats.winratio": "Win Ratio",
		"stats.longuestRally": "Longuest Rally",
		"stats.avgGameLength": "Avgerage Game length",
		"stats.lastMatches": "Match History",
		"stats.guestsMatchup": "Individual matchup stats",
		"stats.guestsChoose": "Choose guest",
		"stats.vsAI": "Recap vs AI",
		"stats.aiExplanation": "Win - Loss vs the 3 AI Difficulties",

		//tournament.html
		"tournament.title": "Tournament",
		"tournament.instructions": "Select 4 players or AI",
		"tournament.start-btn": "Start Tournament",

		//t-waitingscreen.html
		"t-waiting.waitingTitle": "Tournament waiting room",
		"t-waiting.prevWinnerLabel": "Previous Winner:",
		"t-waiting.ready": "Ready",
		"leftplayer": "Left Player",
		"rightplayer": "Right Player",

		//tournament-end.html
		"tournament.endTitle": "🏆 Tournament Champion 🏆",
		"tournament.home-btn": "Return Home",

		//game-end.html
		"endgame.endTitle": "Winner",
		"endgame.home-btn": "Return Home"
	},

	fr: {
		//home.html
		"home.menu": "Menu Principal",
		"home.qmatch": "Partie Rapide",
		"home.tournament": "Tournoi",
		"home.settings": "Parametres",
		"home.profile": "Profil",
		
		//account.html
		"account.info": "Informations du compte",
		"account.username.enter": "Pseudo: ",
		"account.igusername.title": "Pseudo in-game: ",
		"account.new.igusername": "Nouveau pseudo in-game",
		"account.change.pw" : "Modifier le mot de passe",
		"account.change.igusername": "Changer de pseudo in-game",
		"account.oldpass": "Ancien mot de passe",
		"account.newpass": "Nouveau mot de passe",
		"account.conf.pass": "Confirmez le mot de passe",
		"account.save": "Enregistrer",
		"account.butt.2FA": "A2F",
		"account.enable": "Activez la double authentification",
		"account.qr.mess": "Veuillez scanner ce QR code avec votre application d'authentification (Google Authentificator, ...)",
		"account.validate": "Valider",
		"account.cancel": "Annuler",
		"account.2FA.title": "Desactiver la double authentification",
		"account.disable2FA.message": "Veuillez saisir votre mot de passe actuel ainsi qu'un code 2FA pour desactiver la double authentification",
		"account.current.pass": "Mot de passe actuel",
		"account.otc": "Code a usage unique",
		"account.butt.d2FA": "Desactiver l'A2F",

		//ai-selection.html
		"ai.easy-title": "Pour les debutants. L'IA se deplace lentement et reagit tard.",
		"ai.easy-btn": "Facile",
		"ai.medium-title": "Defi equilibre. L'IA a une vitesse et une intelligence moyennes.",
		"ai.medium-btn": "Moyen",
		"ai.hard-title": "IA de niveau expert. Reactions rapides et precises.",
		"ai.hard-btn": "Difficile",
		"lockin": "Verrouiller",
		
		//login.html
		"login.login": "Connexion",
		"login.username": "Pseudo",
		"login.password": "Mot de passe",
		"login.noprofile-msg": " Vous n'avez pas de compte ? ",
		"login.create-acc": "Creer un compte",
		"login.2FA-text": "Double authentification",
		"login.code-msg": "Veuillez entrer le code a 6 chiffres de votre application d'authentification",
		"login.auth-code": "Code d'authentification",
		"login.verify": "Verifier",
		"login.cancel": "Annuler",
		
		//pause.html
		"pause.title": "Menu Pause",
		"pause.resume": "Reprendre",
		"pause.quit": "Quitter",

		//player-selection.html
		"player.select": "Selectionner un joueur",
		"player.login": "Verrouiller",
		"player.add-guest-btn": "Ajouter un invité",
		"player.del-guest-btn": "Supprimer l'invité",

		//player-slot-template.html
		"player-slot.player": "Joueur",
		"player-slot.ai": "IA",
		
		//profile.html
		"profile.friends": "Amis",
		"profile.stats": "Statistiques",
		"profile.account": "Compte",
		"profile.logout": "Deconnexion",
		
		//quick-match.html
		"quick.title": "Configuration de la partie rapide",
		"quick.instructions": "Choisissez 2 joueurs ou IA",
		"quick.start": "Lancer la partie",
		
		//settings.html
		"settings.paddle-size": "Taille de la raquette",
		"settings.paddle-color": "Couleur de la raquette",
		"settings.paddle-speed": "Vitesse de la raquette",
		"settings.ball-color": "Couleur de la balle",
		"settings.ball-size": "Taille de la balle",
		"settings.ball-speed": "Vitesse de la balle",
		"settings.ball-shape": "Forme de la balle",
		"settings.language": "Langue",
		
		//signup.html
		"signup.create-acc": "Creer un compte",
		"signup.username": "Pseudo",
		"signup.password": "Mot de passe",
		"signup.verify-pw": "Verifier le mot de passe",
		"signup.signup-btn": "S'inscrire",

		//stats-dashboard.html
		"stats.statistics": "Statistiques",
		"stats.totalgames": "Parties totales",
		"stats.wins": "Victoires",
		"stats.losses": "Défaites",
		"stats.winratio": "Ratio de victoires",
		"stats.longuestRally": "Plus long échange",
		"stats.avgGameLength": "Durée moyenne d'une partie",
		"stats.lastMatches": "Historique des parties",
		"stats.guestsMatchup": "Statistiques par invité",
		"stats.guestsChoose": "Choisir un invité",
		"stats.vsAI": "Résumé contre l'IA",
		"stats.aiExplanation": "Victoires - Défaites contre les 3 niveaux de difficulté de l'IA",
		
		//tournament.html
		"tournament.title": "Tournoi",
		"tournament.instructions": "Selectionnez 4 joueurs ou IA",
		"tournament.start-btn": "Lancer le tournoi",

		//t-waitingscreen.html
		"t-waiting.waitingTitle": "Salle d'attente du tournoi",
		"t-waiting.prevWinnerLabel": "Vainqueur precedent:",
		"t-waiting.ready": "Pret",
		"leftplayer": "Joueur de gauche",
		"rightplayer": "Joueur de droite",

		//tournament-end.html
		"tournament.endTitle": "🏆 Champion du tournoi 🏆",
		"tournament.home-btn": "Retour a l'accueil",

		//game-end.html
		"endgame.endTitle": "Gagnant",
		"endgame.home-btn": "Retour a l'accueil"
	},
	es: {
		//home.html
		"home.menu": "Menu Principal",
		"home.qmatch": "Partida Rapida",
		"home.tournament": "Torneo",
		"home.settings": "Ajustes",
		"home.profile": "Perfil",

		//account.html
		"account.info": "Informacion de la cuenta",
		"account.username.enter": "Nombre de usuario: ",
		"account.igusername.title": "Nombre de usuario en el juego: ",
		"account.new.igusername": "Nuevo nombre de usuario en el juego",
		"account.change.pw" : "Modificar contrasena",
		"account.change.igusername": "Cambiar nombre de usuario en el juego",
		"account.oldpass": "Contrasena antigua",
		"account.newpass": "Nueva contrasena",
		"account.conf.pass": "Confirmar contrasena",
		"account.save": "Guardar",
		"account.butt.2FA": "2FA",
		"account.enable": "Activar la autenticacion de dos factores",
		"account.qr.mess": "Escanee este codigo QR con su aplicacion de autenticacion (Google Authentificator, ...)",
		"account.validate": "Confirmar",
		"account.cancel": "Cancelar",
		"account.2FA.title": "Desactivacion de la autenticacion de dos factores",
		"account.disable2FA.message": "Ingrese su contrasena actual y un codigo 2FA para desactivar la autenticacion de dos factores.",
		"account.current.pass": "Contrasena actual",
		"account.otc": "Codigo de un solo uso",
		"account.butt.d2FA": "Desactivar 2FA",

		//ai-selection.html
		"ai.easy-title": "Para principiantes. La IA se mueve lentamente y reacciona tarde.",
		"ai.easy-btn": "Facil",
		"ai.medium-title": "Desafio equilibrado. La IA tiene una velocidad e inteligencia medias.",
		"ai.medium-btn": "Medio",
		"ai.hard-title": "IA de nivel experto. Reacciones rapidas y precisas.",
		"ai.hard-btn": "Dificil",
		"lockin": "Bloquear",

		//login.html
		"login.login": "Iniciar sesion",
		"login.username": "Nombre de usuario",
		"login.password": "Contrasena",
		"login.noprofile-msg": " No tienes un perfil ? ",
		"login.create-acc": "Crear cuenta",
		"login.2FA-text": "Autenticacion de dos factores",
		"login.code-msg": "Ingrese el codigo de 6 digitos de su aplicacion de autenticacion",
		"login.auth-code": "Codigo de autenticacion",
		"login.verify": "Verificar",
		"login.cancel": "Cancelar",

		//pause.html
		"pause.title": "Menu de pausa",
		"pause.resume": "Reanudar",
		"pause.quit": "Salir",

		//player-selection.html
		"player.select": "Seleccionar jugador",
		"player.login": "Bloquear",
		"player.add-guest-btn": "Agregar invitado",
		"player.del-guest-btn": "Eliminar invitado",

		//player-slot-template.html
		"player-slot.player": "Jugador",
		"player-slot.ai": "IA",
		
		//profile.html
		"profile.friends": "Amigos",
		"profile.stats": "Estadisticas",
		"profile.account": "Cuenta",
		"profile.logout": "Cerrar sesion",

		//quick-match.html
		"quick.title": "Configuracion de partida rapida",
		"quick.instructions": "Elija 2 jugadores o IA",
		"quick.start": "Iniciar partida",
		
		//settings.html
		"settings.paddle-size": "Tamanio de la paleta",
		"settings.paddle-color": "Color de la paleta",
		"settings.paddle-speed": "Velocidad de la paleta",
		"settings.ball-color": "Color de la pelota",
		"settings.ball-size": "Tamanio de la pelota",
		"settings.ball-speed": "Velocidad de la pelota",
		"settings.ball-shape": "Forma de la pelota",
		"settings.language": "Idioma",
		
		//signup.html
		"signup.create-acc": "Crear una cuenta",
		"signup.username": "Nombre de usuario",
		"signup.password": "Contrasena",
		"signup.verify-pw": "Verificar contrasena",
		"signup.signup-btn": "Registrarse",
		
		//stats-dashboard.html
		"stats.statistics": "Estadísticas",
		"stats.totalgames": "Partidas totales",
		"stats.wins": "Victorias",
		"stats.losses": "Derrotas",
		"stats.winratio": "Ratio de victorias",
		"stats.longuestRally": "Rally más largo",
		"stats.avgGameLength": "Duración media de la partida",
		"stats.lastMatches": "Historial de partidas",
		"stats.guestsMatchup": "Estadísticas por invitado",
		"stats.guestsChoose": "Elegir invitado",
		"stats.vsAI": "Resumen contra la IA",
		"stats.aiExplanation": "Victorias - Derrotas contra las 3 dificultades de la IA",

		//tournament.html
		"tournament.title": "Torneo",
		"tournament.instructions": "Seleccione 4 jugadores o IA",
		"tournament.start-btn": "Iniciar torneo",

		//t-waitingscreen.html
		"t-waiting.waitingTitle": "Espera del torneo",
		"t-waiting.prevWinnerLabel": "Ganador anterior:",
		"t-waiting.ready": "Listo",
		"leftplayer": "Jugador izquierdo",
		"rightplayer": "Jugador derecho",

		//tournament-end.html
		"tournament.endTitle": "🏆 Campeon del torneo 🏆",
		"tournament.home-btn": "Volver al inicio",

		//game-end.html
		"endgame.endTitle": "Ganador",
		"endgame.home-btn": "Volver al inicio"
	}
};

export let currentLang: Lang = "fr";

export function setLang(lang: Lang) {
	currentLang = lang;

	// Handle text content
	document.querySelectorAll<HTMLElement>("[data-i18n]").forEach(el => {
		const key = el.dataset.i18n!;
		const text = translations[currentLang][key];
		if (text) el.innerText = text;
	});

	// Handle title attributes
	document.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach(el => {
		const key = el.dataset.i18nTitle!;
		const text = translations[currentLang][key];
		if (text) el.setAttribute("title", text);
	});
}
