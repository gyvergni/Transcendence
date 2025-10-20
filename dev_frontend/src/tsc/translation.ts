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
		"account.butt.2FA.enable": "Enable 2FA",
		"account.butt.2FA.disable": "Disable A2F",
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
		"login.btn": "Sign In",
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
		"settings.reset": "Reset",

		//signup.html
		"signup.create-acc": "Create an account",
		"signup.username": "Username",
		"signup.password": "Password",
		"signup.verify-pw": "Verify Password",
		"signup.signup-btn": "Sign Up",

		//stats-dashboard.html
		"stats.statistics": "Statistics",
        "stats.selectUser": "Select User",
        "stats.summtotal": "Games played",
        "stats.summwins": "Wins",
        "stats.summlosses": "Losses",
        "stats.summwinp": "Win %",
        "stats.summlongrally": "Longest rally",
        "stats.matchHistory": "Match History",
        "stats.matchup": "Guest Matchup",
        "stats.tournament": "Tournament Stats",
        "stats.t-played": "Played",
        "stats.t-finals": "Finals played",
        "stats.t-won": "Won",
        "stats.averages": "Game Averages",
        "stats.avg-inputs": "Inputs",
        "stats.avg-length": "Game length",
        "stats.avg-wb": "Wall bounces",
        "stats.general": "General Stats",
        "stats.total-time": "Time played",
        "stats.total-inputs": "Total inputs",
        "stats.total-wallBounces": "Total wall bounces",
        "stats.total-hits": "Total hits",
        "stats.total-ptswon": "Points won",
        "stats.total-ptslost": "Points lost",
        "stats.t-first": "Tournament First Round",
        "stats.t-final": "Tournament Final",
        "stats.mode": "Mode",
        "stats.quickMatch": "Quick Match",
                //Dynamic content in stats.ts
                "stats.select_matchup": "Select opponent",
                "stats.wins": "Wins",
                "stats.losses": "Losses",
                "stats.default": "(Main)",
                "stats.matchup-ylabel": "Number of games",
                
        //match-detail.html
        "match.title": "Match Detail",
        "match.game-settings": "Game Settings",
        "match.settings-ballsize": "Ball Size: ",
        "match.settings-ballspeed": "Ball Speed: ",
        "match.settings-paddlesize": "Paddle Size: ",
        "match.settings-paddlespeed": "Paddle Speed: ",
        "match.settings-gamemode": "Game Mode: ",
        "match.totalhits": "Total Hits: ",
        "match.totaltime": "Total Time: ",
        "match.longestrally": "Longest Rally: ",
        "match.stats": "Match Stats",
        "match.player": "Player",
        "match.score": "Score",
        "match.wb": "Wall bounces",
        "match.inputs": "Inputs",
        "match.graph-title": "Point Timeline",
            //Dynamic content in stats.ts
            "match.timeline-ylabel": "Rally Duration (s)",
            "match.timeline-xlabel": "Point",

		//tournament.html
		"tournament.title": "Tournament",
		"tournament.instructions": "Select 4 players or AI",
		"tournament.start-btn": "Start Tournament",

		//t-waitingscreen.html
		"t-waiting.waitingTitle": "Tournament waiting room",
		"t-waiting.prevWinnerLabel": "Previous Winner:",
		"t-waiting.ready": "Ready",
        "t-waiting.nextmatch": "Next Match",

		//tournament-end.html
		"tournament.endTitle": "🏆 Tournament Champion 🏆",
		"tournament.return": "Return Home",

		//game-end.html
		"endgame.endTitle": "Winner",
		"endgame.return": "Return Home",


		// Error messages
		"error.guest.not_found": "Guest not found",
		"error.guest.fetch_failed": "Failed to fetch guests",
		"error.guest.username_reserved": "Username ‘Deleted Guest‘ is reserved and cannot be used",
		"error.guest.create_failed": "Failed to create guest",
		"error.guest.host_username_conflict": "Guest pseudo cannot be the same as your host in-game username",
		"error.guest.list_full": "Guest list is full, you cannot create more than 10 guests",
		"error.guest.duplicate_username": "Guest with this pseudo already exists",
		"error.guest.delete_failed": "An error occurred while deleting the guest",
		"error.guest.delete.not_found": "You cannot delete a guest that does not exist",
		"error.guest.delete_host": "You cannot delete the host player",

		"error.stats.player_not_found": "Player not found",
		"error.stats.add_match_failed": "Failed to add match",
		"error.stats.fetch_failed": "Failed to fetch stats",
		
		"error.user.not_found": "User not found",
		"error.user.duplicate_username": "Pseudo already exists",
		"error.user.create_failed": "Failed to create user",
		"error.user.fetch_failed": "Failed to fetch users",
		"error.user.invalid_old_password": "Invalid old password",
		"error.user.username_reserved": "Username 'Deleted Guest' is reserved and cannot be used",
		"error.user.invalid_password": "Invalid password",
		"error.user.username_taken_by_guest": "This pseudo is already taken by a guest",
		"error.user.change_password_failed": "Failed to change password",
		"error.user.change_username_failed": "Failed to change username",
		"error.user.avatar_no_file": "No file uploaded",
		"error.user.change_avatar_failed": "Failed to change avatar",
		"error.user.avatar_not_found": "Avatar not found",
		"error.user.get_avatar_failed": "Failed to get avatar",
		
		"error.auth.invalid_credentials": "Invalid pseudo or password",
		"error.auth.login_failed": "Failed to login user",
		"error.auth.no_token": "No access token provided",
		"error.auth.invalid_token": "Invalid access token",
		"error.auth.logout_failed": "Failed to logout user",

		"error.friend.not_found": "No friends found",
		"error.friend.fetch_failed": "Failed to fetch friends",
		"error.friend.add_self": "You cannot add yourself as a friend",
		"error.friend.already_friends": "You are already friends with this user",
		"error.friend.add_failed": "Failed to add friend",
		"error.friend.not_friends": "You are not friends with this user",
		"error.friend.delete_failed": "Failed to delete friend",

	},

	fr: {		//home.html
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
		"account.butt.2FA.enable": "Activer A2F",
		"account.butt.2FA.disable": "Desactiver A2F",
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
		"login.btn": "Se connecter",
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
		"settings.reset": "Réinitialiser",
		
		//signup.html
		"signup.create-acc": "Creer un compte",
		"signup.username": "Pseudo",
		"signup.password": "Mot de passe",
		"signup.verify-pw": "Verifier le mot de passe",
		"signup.signup-btn": "S'inscrire",

		//stats-dashboard.html
        "stats.statistics": "Statistiques",
        "stats.selectUser": "Sélectionner un utilisateur",
        "stats.summtotal": "Parties jouées",
        "stats.summwins": "Victoires",
        "stats.summlosses": "Défaites",
        "stats.summwinp": "Taux de victoire",
        "stats.summlongrally": "Plus long échange",
        "stats.matchHistory": "Historique des matchs",
        "stats.matchup": "Statistiques par adversaire",
        "stats.tournament": "Statistiques Tournoi",
        "stats.t-played": "Joués",
        "stats.t-finals": "Finales jouées",
        "stats.t-won": "Gagnés",
        "stats.averages": "Moyennes par partie",
        "stats.avg-inputs": "Entrées",
        "stats.avg-length": "Durée moyenne",
        "stats.avg-wb": "Rebonds muraux",
        "stats.general": "Statistiques générales",
        "stats.total-time": "Temps",
        "stats.total-inputs": "Entrées",
        "stats.total-wallBounces": "Rebonds muraux",
        "stats.total-hits": "Coups totaux",
        "stats.total-ptswon": "Pts gagnés",
        "stats.total-ptslost": "Pts perdus",
                //Dynamic content in stats.ts
                "stats.select_matchup": "Sélectionner un adversaire",
                "stats.wins": "Victoires",
                "stats.losses": "Défaites",
                "stats.t-first": "Tournoi Premier Tour",
                "stats.t-final": "Tournoi Finale",
                "stats.mode": "Mode",
                "stats.quickMatch": "Partie Rapide",
                "stats.default": "(Principal)",
                "stats.matchup-ylabel": "Nombre de parties",

        //match-detail.html
        "match.title": "Détail du match",
        "match.game-settings": "Paramètres du jeu",
        "match.settings-ballsize": "Taille de la balle : ",
        "match.settings-ballspeed": "Vitesse de la balle : ",
        "match.settings-paddlesize": "Taille de la raquette : ",
        "match.settings-paddlespeed": "Vitesse de la raquette : ",
        "match.settings-gamemode": "Mode de jeu : ",
        "match.totalhits": "Coups totaux : ",
        "match.totaltime": "Temps total : ",
        "match.longestrally": "Plus long échange : ",
        "match.stats": "Statistiques du match",
        "match.player": "Joueur",
        "match.score": "Score",
        "match.wb": "Rebonds muraux",
        "match.inputs": "Entrées",
        "match.graph-title": "Chronologie des points",
            //Dynamic content in stats.ts
            "match.timeline-ylabel": "Durée de l'échange (s)",
            "match.timeline-xlabel": "Point",

		//tournament.html
		"tournament.title": "Tournoi",
		"tournament.instructions": "Selectionnez 4 joueurs ou IA",
		"tournament.start-btn": "Lancer le tournoi",

		//t-waitingscreen.html
		"t-waiting.waitingTitle": "Salle d'attente du tournoi",
		"t-waiting.prevWinnerLabel": "Vainqueur precedent:",
		"t-waiting.ready": "Pret",
		"t-waiting.nextmatch": "Match suivant",

		//tournament-end.html
		"tournament.endTitle": "🏆 Champion du tournoi 🏆",
		"tournament.return": "Accueil",

		//game-end.html
		"endgame.endTitle": "Gagnant",
		"endgame.return": "Retour a l'accueil",


		// Error messages
		"error.guest.not_found": "Invite introuvable",
		"error.guest.fetch_failed": "Echec de la recuperation des invites",
		"error.guest.username_reserved": "Le pseudo 'Deleted Guest' est reserve et ne peut pas etre utilise",
		"error.guest.create_failed": "Echec de la creation de l'invite",
		"error.guest.host_username_conflict": "Le pseudo de l'invite ne peut pas etre le meme que votre pseudo in-game",
		"error.guest.list_full": "La liste des invites est pleine (max 10)",
		"error.guest.duplicate_username": "Un invite avec ce pseudo existe deja",
		"error.guest.delete_failed": "Une erreur est survenue lors de la suppression de l'invite",
		"error.guest.delete.not_found": "Vous ne pouvez pas supprimer un invite qui n'existe pas",
		"error.guest.delete_host": "Vous ne pouvez pas supprimer le joueur hote",

		"error.stats.player_not_found": "Joueur introuvable",
		"error.stats.add_match_failed": "Echec de l'ajout du match",
		"error.stats.fetch_failed": "Echec de la recuperation des statistiques",
		
		"error.user.not_found": "Utilisateur introuvable",
		"error.user.duplicate_username": "Le pseudo existe deja",
		"error.user.create_failed": "Echec de la creation de l'utilisateur",
		"error.user.fetch_failed": "Echec de la recuperation des utilisateurs",
		"error.user.invalid_old_password": "Ancien mot de passe invalide",
		"error.user.username_reserved": "Le pseudo 'Deleted Guest' est reserve et ne peut pas etre utilise",
		"error.user.invalid_password": "Mot de passe invalide",
		"error.user.username_taken_by_guest": "Ce pseudo est deja utilise par un invite",
		"error.user.change_password_failed": "Echec du changement de mot de passe",
		"error.user.change_username_failed": "Echec du changement de pseudo",
		"error.user.avatar_no_file": "Aucun fichier envoye",
		"error.user.change_avatar_failed": "Echec du changement d'avatar",
		"error.user.avatar_not_found": "Avatar introuvable",
		"error.user.get_avatar_failed": "Echec de la recuperation de l'avatar",
		
		"error.auth.invalid_credentials": "Pseudo ou mot de passe invalide",
		"error.auth.login_failed": "Echec de la connexion",
		"error.auth.no_token": "Aucun jeton d'acces fourni",
		"error.auth.invalid_token": "Jeton d'acces invalide",
		"error.auth.logout_failed": "Echec de la deconnexion",

		"error.friend.not_found": "Aucun ami trouve",
		"error.friend.fetch_failed": "Echec de la recuperation des amis",
		"error.friend.add_self": "Vous ne pouvez pas vous ajouter en ami",
		"error.friend.already_friends": "Vous etes deja amis avec cet utilisateur",
		"error.friend.add_failed": "Echec de l'ajout de l'ami",
		"error.friend.not_friends": "Vous n'etes pas amis avec cet utilisateur",
		"error.friend.delete_failed": "Echec de la suppression de l'ami",
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
		"account.butt.2FA.enable": "Activar 2FA",
		"account.butt.2FA.disable": "Desactivar A2F",
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
		"login.btn": "Iniciar sesion",
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
		"settings.reset": "Reiniciar",
		
		//signup.html
		"signup.create-acc": "Crear una cuenta",
		"signup.username": "Nombre de usuario",
		"signup.password": "Contrasena",
		"signup.verify-pw": "Verificar contrasena",
		"signup.signup-btn": "Registrarse",
		
		//stats-dashboard.html
		"stats.statistics": "Estadísticas",
        "stats.selectUser": "Seleccionar usuario",
        "stats.summtotal": "Partidos jugados",
        "stats.summwins": "Victorias",
        "stats.summlosses": "Derrotas",
        "stats.summwinp": "Porcentaje de victorias",
        "stats.summlongrally": "Rally más largo",
        "stats.matchHistory": "Historial de partidos",
        "stats.matchup": "Enfrentamiento",
        "stats.tournament": "Estadísticas de torneos",
        "stats.t-played": "Jugados",
        "stats.t-finals": "Finales jugadas",
        "stats.t-won": "Ganados",
        "stats.averages": "Promedios por partido",
        "stats.avg-inputs": "Entradas",
        "stats.avg-length": "Duración media",
        "stats.avg-wb": "Rebotes en pared",
        "stats.general": "Estadísticas generales",
        "stats.total-time": "Tiempo total de juego",
        "stats.total-inputs": "Entradas totales",
        "stats.total-wallBounces": "Rebotes totales",
        "stats.total-hits": "Golpes totales",
        "stats.total-ptswon": "Puntos ganados",
        "stats.total-ptslost": "Puntos perdidos",
        
                //Dynamic content in stats.ts
                "stats.select_matchup": "Seleccionar oponente",
                "stats.wins": "Victorias",
                "stats.losses": "Derrotas",
                "stats.t-first": "Torneo Primera Ronda",
                "stats.t-final": "Torneo Final",
                "stats.mode": "Modo",
                "stats.quickMatch": "Partida Rapida",
                "stats.default": "(Principal)",
                "stats.matchup-ylabel": "Partidas",

        //match-detail.html
        "match.title": "Detalle del partido",
        "match.game-settings": "Configuracion del juego",
        "match.settings-ballsize": "Tamanio de la pelota: ",
        "match.settings-ballspeed": "Velocidad de la pelota: ",
        "match.settings-paddlesize": "Tamanio de la paleta: ",
        "match.settings-paddlespeed": "Velocidad de la paleta: ",
        "match.settings-gamemode": "Modo de juego: ",
        "match.totalhits": "Golpes totales: ",
        "match.totaltime": "Tiempo total: ",
        "match.longestrally": "Rally mas largo: ",
        "match.stats": "Estadisticas del partido",
        "match.player": "Jugador",
        "match.score": "Puntuacion",
        "match.wb": "Rebotes en pared",
        "match.inputs": "Entradas",
        "match.graph-title": "Cronologia de puntos",
            //Dynamic content in stats.ts
            "match.timeline-ylabel": "Duracion del rally (s)",
            "match.timeline-xlabel": "Punto",

		//tournament.html
		"tournament.title": "Torneo",
		"tournament.instructions": "Seleccione 4 jugadores o IA",
		"tournament.start-btn": "Iniciar torneo",

		//t-waitingscreen.html
		"t-waiting.waitingTitle": "Espera del torneo",
		"t-waiting.prevWinnerLabel": "Ganador anterior:",
		"t-waiting.ready": "Listo",
		"t-waiting.nextmatch": "Proximo partido",

		//tournament-end.html
		"tournament.endTitle": "🏆 Campeon del torneo 🏆",
		"tournament.return": "Volver al inicio",

		//game-end.html
		"endgame.endTitle": "Ganador",
		"endgame.return": "Volver al inicio",


		// Error messages
		"error.guest.not_found": "Invitado no encontrado",
		"error.guest.fetch_failed": "Error al obtener invitados",
		"error.guest.username_reserved": "El nombre 'Deleted Guest' esta reservado y no puede usarse",
		"error.guest.create_failed": "Error al crear invitado",
		"error.guest.host_username_conflict": "El nombre del invitado no puede ser el mismo que tu nombre en el juego",
		"error.guest.list_full": "La lista de invitados esta llena (max 10)",
		"error.guest.duplicate_username": "Ya existe un invitado con este nombre",
		"error.guest.delete_failed": "Ocurrio un error al eliminar el invitado",
		"error.guest.delete.not_found": "No puedes eliminar un invitado que no existe",


		"error.stats.player_not_found": "Jugador no encontrado",
		"error.stats.add_match_failed": "Error al agregar partida",
		"error.stats.fetch_failed": "Error al obtener estadisticas",

		"error.user.not_found": "Usuario no encontrado",
		"error.user.duplicate_username": "El pseudo ya existe",
		"error.user.create_failed": "Error al crear usuario",
		"error.user.fetch_failed": "Error al obtener usuarios",
		"error.user.invalid_old_password": "Contrasena antigua invalida",
		"error.user.username_reserved": "El nombre 'Deleted Guest' esta reservado y no puede usarse",
		"error.user.invalid_password": "Contrasena invalida",
		"error.user.username_taken_by_guest": "Este pseudo ya esta usado por un invitado",
		"error.user.change_password_failed": "Error al cambiar la contrasena",
		"error.user.change_username_failed": "Error al cambiar el nombre",
		"error.user.avatar_no_file": "No se subio ningun archivo",
		"error.user.change_avatar_failed": "Error al cambiar el avatar",
		"error.user.avatar_not_found": "Avatar no encontrado",
		"error.user.get_avatar_failed": "Error al obtener el avatar",

		"error.auth.invalid_credentials": "Pseudo o contrasena invalido",
		"error.auth.login_failed": "Error al iniciar sesion",
		"error.auth.no_token": "No se proporciono token de acceso",
		"error.auth.invalid_token": "Token de acceso invalido",
		"error.auth.logout_failed": "Error al cerrar sesion",

		"error.friend.not_found": "No se encontraron amigos",
		"error.friend.fetch_failed": "Error al obtener amigos",
		"error.friend.add_self": "No puedes agregarte a ti mismo como amigo",
		"error.friend.already_friends": "Ya son amigos",
		"error.friend.add_failed": "Error al agregar amigo",
		"error.friend.not_friends": "No eres amigo de este usuario",
		"error.friend.delete_failed": "Error al eliminar amigo",
	}
};

export let currentLang: Lang = "en";

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

export function getTranslatedKey(key: string): string {
	const message = translations[currentLang][key];
	return message ? message : key;
}