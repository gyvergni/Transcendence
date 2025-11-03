export type Lang = "fr" | "en" | "es";

const translations: Record<Lang, Record<string, string>> = 
{
	en: {
		//
		"error.internal": "Internal error",
		"websocket.connection_failed": "Connection failed. WebSocket required for login. Try to login.",

		//home.html
		"home.menu": "Main Menu",
		"home.qmatch": "Quick Match",
		"home.tournament": "Tournament",
		"home.settings": "Game Settings",
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
		"account.change-password.mismatch": "New password and confirm password do not match",
		"account.save": "Save",
		"account.butt.2FA": "2FA",
		"account.butt.2FA.enable": "Enable 2FA",
		"account.butt.2FA.disable": "Disable 2FA",
		"account.enable": "Activate two-factor authentication",
		"account.qr.mess": "Scan this QR code with your authentication app (Google Authenticator, ...)",
		"account.validate": "Confirm",
		"account.cancel": "Cancel",
		"account.2FA.token.placeholder": "Enter the generated token",
		"account.2FA.nosession" : "No session ID found, cannot enable 2FA. Please try again.",
		"account.2FA.enable.token.required": "2FA token is required to enable 2FA",
		"account.2FA.invalid_token": "Invalid 2FA token.",
		"account.2FA.enable.success": "2FA has been successfully enabled.",
		"account.2FA.title": "Deactivate two-factor authentication",
		"account.disable2FA.message": "Enter your current password and a 2FA code to disable two-factor authentication.",
		"account.current.pass": "Current password",
		"account.2FA.password.placeholder": "Enter your current password",
		"account.2FA.disable.password.required": "Password is required to disable 2FA",
		"account.2FA.disable.token.required": "2FA token is required to disable 2FA",
		"account.2FA.invalid_password": "Invalid password.",
		"account.otc": "One-time code",
		"account.butt.d2FA": "Disable 2FA",
		"account.2FA.disable.success": "2FA has been successfully disabled.",
		"account.2FA.password_and_token_required": "Password and token are required",
		"account.avatar.upload.too-large": "Avatar file is too large. Maximum size is 5MB.",
		"account.avatar.upload.invalid-type": "Only valid PNG and JPG images are allowed.",
		"account.avatar.upload.error": "Failed to upload avatar. Please try again.",

		//ai-selection.html
		"ai.easy-title": "For beginners. AI moves slowly and reacts late.",
		"ai.easy-btn": "Easy",
		"ai.medium-title": "Balanced challenge. AI has average speed and intelligence.",
		"ai.medium-btn": "Medium",
		"ai.hard-title": "Expert-level AI. Fast and accurate reactions.",
		"ai.hard-btn": "Hard",
		"lockin": "Lock In",
		"ai.difficulty.null": "Select a difficulty first",

		//login.html
		"login.login": "Login",
		"login.username": "Username",
		"login.password": "Password",
		"login.btn": "Sign In",
		"login.noprofile-msg": " Don't have a profile ? ",
		"login.create-acc": "Create Account",
		"login.2FA-text": "Two-Factor Authentication",
		"login.token_required": "2FA token is required",
		"login.2FA_connect.error": "Failed to connect using 2FA token. Please try again.",
		"login.code-msg": "Enter the 6-digit code from your authenticator app",
		"login.auth-code": "Authentication Code",
		"login.verify": "Verify",
		"login.cancel": "Cancel",
		"login.username-password.required": "Username and password are required",

		//pause.html
		"pause.title": "Pause Menu",
		"pause.resume": "Resume",
		"pause.quit": "Quit",

		//player-selection.html
		"player.search.placeholder": "Search",
		"player.select": "Select Player",
		"player.login": "Lock in",
		"player.add-guest-btn": "Add Guest",
		"player.del-guest-btn": "Delete Guest",

		//player-selection dynamic content
		"player.ready": "Ready",
		"player.ai-easy": "AI easy",
		"player.ai-medium": "AI medium",
		"player.ai-hard": "AI hard",
		"player.deleted": "Deleted Guest",

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
		"quick.command": "To move : Left : W D, Right : ↑ ↓",

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
		"signup.pass-mismatch": "Password and verify password do not match",
		"signup.username.length": "Username must be between 3 and 10 characters",
		"signup.username.invalid-chars": "Username contains invalid characters",
		"signup.password.length": "Password must be at least 6 characters long",

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
		// "leftplayer": "Left Player",
		// "rightplayer": "Right Player",
		"t-waiting.nextmatch": "Next Match",

		//tournament-end.html
		"tournament.endTitle": "🏆 Tournament Champion 🏆",
		"tournament.return": "Return Home",

		//game-end.html
		"endgame.endTitle": "Winner",
		"endgame.return": "Return Home",

		//friends.html
		"friends.title": "Friends",
		"friends.add": "Add Friend",
		"friends.reload": "Reload",
		"friends.search.placeholder": "Search",
		"friends.noFriends": "You have no friends yet.",
		"friends.search.noMatch": "No friends match your search.",
		"friends.add.title": "Add a friend",
		"friends.add.label": "Friend username",
		"friends.add.placeholder": "Enter username",
		"friends.add.submit": "Add",
		"friends.cancel": "Cancel",

		// Error messages
		"error.guest.not_found": "Guest not found",
		"error.guest.invalid_username_characters": "Guest username contains invalid characters",
		"error.guest.fetch_failed": "Failed to fetch guests",
		"error.guest.username_reserved": "This username is reserved and cannot be used",
		"error.guest.add.already_exists": "Guest with this username already exists",
		"error.guest.create_failed": "Failed to create guest",
		"error.guest.host_username_conflict": "Guest username cannot be the same as your host in-game username",
		"error.guest.list_full": "Guest list is full, you cannot create more than 10 guests",
		"error.guest.duplicate_username": "Guest with this username already exists",
		"error.guest.delete_failed": "An error occurred while deleting the guest",
		"error.guest.delete.not_found": "You cannot delete a guest that does not exist",
		"error.guest.delete_host": "You cannot delete the host player",
		"error.guest.delete_locked_in": "You cannot delete a player who is already locked in.",
		"error.guest.unregistered": "This player does not exist.",
		"error.guest.already_locked_in": "This player is already locked in.",

		"error.stats.player_not_found": "Player not found",
		"error.stats.add_match_failed": "Failed to add match",
		"error.stats.fetch_failed": "Failed to fetch stats",
		
		"error.user.not_found": "User not found",
		"error.user.duplicate_username": "Username already exists",
		"error.user.invalid_username_characters": "Username contains invalid characters",
		"error.user.create_failed": "Failed to create user",
		"error.user.fetch_failed": "Failed to fetch users",
		"error.user.invalid_old_password": "Invalid old password",
		"error.user.username_reserved": "This username is reserved and cannot be used",
		"error.user.invalid_password": "Invalid password",
		"error.user.username_taken_by_guest": "This username is already taken by a guest",
		"error.user.change_password_failed": "Failed to change password",
		"error.user.change_username_failed": "Failed to change username",
		"error.user.avatar_no_file": "No file uploaded",
		"error.user.change_avatar_failed": "Failed to change avatar",
		"error.user.avatar_not_found": "Avatar not found",
		"error.user.get_avatar_failed": "Failed to get avatar",
		
		"error.auth.invalid_credentials": "Invalid username or password",
		"error.auth.login_failed": "Failed to login user",
		"error.auth.no_token": "No access token provided",
		"error.auth.invalid_token": "Invalid access token",
		"error.auth.logout_failed": "Failed to logout user",
		"error.auth.session_expired": "Session expired or invalid",

		"error.friend.not_found": "No friends found",
		"error.friend.fetch_failed": "Failed to fetch friends",
		"error.friend.add_self": "You cannot add yourself as a friend",
		"error.friend.already_friends": "You are already friends with this user",
		"error.friend.add_failed": "Failed to add friend",
		"error.friend.not_friends": "You are not friends with this user",
		"error.friend.delete_failed": "Failed to delete friend",
		"error.views.notlockedin": "Both Players must be locked in",

		// Success messages
		"success.guest.added": "Guest added successfully",
		"success.guest.deleted": "Guest deleted successfully",
		
		// Network error
		"error.network": "Network error occurred",
	},

	fr: {		
		//
		"error.internal": "Erreur interne",
		"websocket.connection_failed": "Échec de la connexion. WebSocket requis pour la connexion. Essayez de vous reconnecter.",
		
		//home.html
		"home.menu": "Menu Principal",
		"home.qmatch": "Partie Rapide",
		"home.tournament": "Tournoi",
		"home.settings": "Paramètres du Jeu",
		"home.profile": "Profil",
		
		//account.html
		"account.info": "Informations du compte",
		"account.username.enter": "Pseudo: ",
		"account.igusername.title": "Pseudo en jeu: ",
		"account.new.igusername": "Nouveau pseudo en jeu",
		"account.change.pw" : "Modifier le mot de passe",
		"account.change.igusername": "Changer de pseudo en jeu",
		"account.oldpass": "Ancien mot de passe",
		"account.newpass": "Nouveau mot de passe",
		"account.conf.pass": "Confirmez le mot de passe",
		"account.change-password.mismatch": "Le nouveau mot de passe et la confirmation ne correspondent pas",
		"account.save": "Enregistrer",
		"account.butt.2FA": "A2F",
		"account.butt.2FA.enable": "Activer A2F",
		"account.butt.2FA.disable": "Désactiver A2F",
		"account.enable": "Activez la double authentification",
		"account.qr.mess": "Veuillez scanner ce QR code avec votre application d'authentification (Google Authenticator, ...)",
		"account.validate": "Valider",
		"account.cancel": "Annuler",
		"account.2FA.token.placeholder": "Entrez le token généré",
		"account.2FA.nosession" : "Aucun ID de session trouvé, impossible d'activer l'A2F. Veuillez réessayer.",
		"account.2FA.enable.token.required": "Le token A2F est requis pour activer l'A2F",
		"account.2FA.token.required": "Le token A2F est requis pour activer l'A2F",
		"account.2FA.invalid_token": "Token A2F invalide.",
		"account.2FA.enable.success": "L'A2F a été activée avec succès.",
		"account.2FA.title": "Désactiver la double authentification",
		"account.disable2FA.message": "Veuillez saisir votre mot de passe actuel ainsi qu'un code A2F pour désactiver la double authentification",
		"account.current.pass": "Mot de passe actuel",
		"account.2FA.password.placeholder": "Entrez votre mot de passe actuel",
		"account.2FA.disable.password.required": "Le mot de passe est requis pour désactiver l'A2F",
		"account.2FA.disable.token.required": "Le token A2F est requis pour désactiver l'A2F",
		"account.2FA.invalid_password": "Mot de passe invalide.",
		"account.otc": "Code à usage unique",
		"account.butt.d2FA": "Désactiver l'A2F",
		"account.2FA.disable.success": "L'A2F a été désactivée avec succès.",
		"account.2FA.password_and_token_required": "Le mot de passe et le token sont requis",
		"account.avatar.upload.too-large": "Le fichier avatar est trop volumineux. Taille maximale : 5MB.",
		"account.avatar.upload.invalid-type": "Seules les images PNG et JPG valides sont autorisées.",
		"account.avatar.upload.error": "Échec du téléchargement de l'avatar. Veuillez réessayer.",

		//ai-selection.html
		"ai.easy-title": "Pour les débutants. L'IA se déplace lentement et réagit tard.",
		"ai.easy-btn": "Facile",
		"ai.medium-title": "Défi équilibré. L'IA a une vitesse et une intelligence moyennes.",
		"ai.medium-btn": "Moyen",
		"ai.hard-title": "IA de niveau expert. Réactions rapides et précises.",
		"ai.hard-btn": "Difficile",
		"lockin": "Verrouiller",
		"ai.difficulty.null": "Sélectionner d'abord une difficulté",
		
		//login.html
		"login.login": "Connexion",
		"login.username": "Pseudo",
		"login.password": "Mot de passe",
		"login.btn": "Se connecter",
		"login.noprofile-msg": " Vous n'avez pas de compte ? ",
		"login.create-acc": "Créer un compte",
		"login.2FA-text": "Double authentification",
		"login.token_required": "Le token A2F est requis",
		"login.2FA_connect.error": "Échec de la connexion avec le token A2F. Veuillez réessayer.",
		"login.code-msg": "Veuillez entrer le code à 6 chiffres de votre application d'authentification",
		"login.auth-code": "Code d'authentification",
		"login.verify": "Vérifier",
		"login.cancel": "Annuler",
		"login.username-password.required": "Un pseudo et un mot de passe sont requis",
		
		//pause.html
		"pause.title": "Menu Pause",
		"pause.resume": "Reprendre",
		"pause.quit": "Quitter",

		//player-selection.html
		"player.search.placeholder": "Rechercher",
		"player.select": "Sélectionner un joueur",
		"player.login": "Verrouiller",
		"player.add-guest-btn": "Ajouter un invité",
		"player.del-guest-btn": "Supprimer l'invité",

		//player-selection dynamic content
		"player.ready": "Prêt",
		"player.ai-easy": "IA facile",
		"player.ai-medium": "IA moyenne",
		"player.ai-hard": "IA difficile",
		"player.deleted": "Invité Supprimé",

		//player-slot-template.html
		"player-slot.player": "Joueur",
		"player-slot.ai": "IA",
		
		//profile.html
		"profile.friends": "Amis",
		"profile.stats": "Statistiques",
		"profile.account": "Compte",
		"profile.logout": "Déconnexion",
		
		//quick-match.html
		"quick.title": "Configuration de la partie rapide",
		"quick.instructions": "Choisissez 2 joueurs ou IA",
		"quick.start": "Lancer la partie",
		"quick.command": "Pour se deplacer : Gauche : W D, Droite : ↑ ↓",
		
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
		"signup.create-acc": "Créer un compte",
		"signup.username": "Pseudo",
		"signup.password": "Mot de passe",
		"signup.verify-pw": "Vérifier le mot de passe",
		"signup.signup-btn": "S'inscrire",
		"signup.pass-mismatch": "Le mot de passe et la vérification ne correspondent pas",
		"signup.username.length": "Le pseudo doit contenir entre 3 et 10 caractères",
		"signup.username.invalid-chars": "Le pseudo contient des caractères invalides",
		"signup.password.length": "Le mot de passe doit contenir au moins 6 caractères",

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
		"tournament.instructions": "Sélectionnez 4 joueurs ou IA",
		"tournament.start-btn": "Lancer le tournoi",

		//t-waitingscreen.html
		"t-waiting.waitingTitle": "Salle d'attente du tournoi",
		"t-waiting.prevWinnerLabel": "Vainqueur précédent:",
		"t-waiting.ready": "Prêt",
		// "leftplayer": "Joueur de gauche",
		// "rightplayer": "Joueur de droite",
		"t-waiting.nextmatch": "Match suivant",

		//tournament-end.html
		"tournament.endTitle": "🏆 Champion du tournoi 🏆",
		"tournament.return": "Accueil",

		//game-end.html
		"endgame.endTitle": "Gagnant",
		"endgame.return": "Retour à l'accueil",

		//friends.html
		"friends.title": "Amis",
		"friends.add": "Ajouter un ami",
		"friends.reload": "Rafraîchir",
		"friends.search.placeholder": "Chercher",
		"friends.noFriends": "Vous n'avez pas encore d'amis.",
		"friends.search.noMatch": "Aucun ami ne correspond à votre recherche.",
		"friends.add.title": "Ajouter un ami",
		"friends.add.label": "Pseudo de l'ami",
		"friends.add.placeholder": "Entrez le pseudo",
		"friends.add.submit": "Ajouter",
		"friends.cancel": "Annuler",

		// Error messages
		"error.guest.not_found": "Invité introuvable",
		"error.guest.invalid_username_characters": "Le pseudo de l'invité contient des caractères invalides",
		"error.guest.fetch_failed": "Échec de la récupération des invités",
		"error.guest.username_reserved": "Ce pseudo est réservé et ne peut pas être utilisé",
		"error.guest.add.already_exists": "Un invité avec ce pseudo existe déjà",
		"error.guest.create_failed": "Échec de la création de l'invité",
		"error.guest.host_username_conflict": "Le pseudo de l'invité ne peut pas être le même que votre pseudo en jeu",
		"error.guest.list_full": "La liste des invités est pleine (max 10)",
		"error.guest.duplicate_username": "Un invité avec ce pseudo existe déjà",
		"error.guest.delete_failed": "Une erreur est survenue lors de la suppression de l'invité",
		"error.guest.delete.not_found": "Vous ne pouvez pas supprimer un invité qui n'existe pas",
		"error.guest.delete_host": "Vous ne pouvez pas supprimer le joueur hôte",
		"error.guest.delete_locked_in": "Vous ne pouvez pas supprimer un joueur déjà verrouillé.",
		"error.guest.unregistered": "Ce joueur n'existe pas.",
		"error.guest.already_locked_in": "Ce joueur est déjà verrouillé.",

		"error.stats.player_not_found": "Joueur introuvable",
		"error.stats.add_match_failed": "Échec de l'ajout du match",
		"error.stats.fetch_failed": "Échec de la récupération des statistiques",
		
		"error.user.not_found": "Utilisateur introuvable",
		"error.user.duplicate_username": "Le pseudo existe déjà",
		"error.user.invalid_username_characters": "Le pseudo contient des caractères invalides",
		"error.user.create_failed": "Échec de la création de l'utilisateur",
		"error.user.fetch_failed": "Échec de la récupération des utilisateurs",
		"error.user.invalid_old_password": "Ancien mot de passe invalide",
		"error.user.username_reserved": "Ce pseudo est réservé et ne peut pas être utilisé",
		"error.user.invalid_password": "Mot de passe invalide",
		"error.user.username_taken_by_guest": "Ce pseudo est déjà utilisé par un invité",
		"error.user.change_password_failed": "Échec du changement de mot de passe",
		"error.user.change_username_failed": "Échec du changement de pseudo",
		"error.user.avatar_no_file": "Aucun fichier envoyé",
		"error.user.change_avatar_failed": "Échec du changement d'avatar",
		"error.user.avatar_not_found": "Avatar introuvable",
		"error.user.get_avatar_failed": "Échec de la récupération de l'avatar",
		
		"error.auth.invalid_credentials": "Pseudo ou mot de passe invalide",
		"error.auth.login_failed": "Échec de la connexion",
		"error.auth.no_token": "Aucun jeton d'accès fourni",
		"error.auth.invalid_token": "Jeton d'accès invalide",
		"error.auth.logout_failed": "Échec de la déconnexion",
		"error.auth.session_expired": "Session expirée ou invalide",

		"error.friend.not_found": "Aucun ami trouvé",
		"error.friend.fetch_failed": "Échec de la récupération des amis",
		"error.friend.add_self": "Vous ne pouvez pas vous ajouter en ami",
		"error.friend.already_friends": "Vous êtes déjà amis avec cet utilisateur",
		"error.friend.add_failed": "Échec de l'ajout de l'ami",
		"error.friend.not_friends": "Vous n'êtes pas amis avec cet utilisateur",
		"error.friend.delete_failed": "Échec de la suppression de l'ami",
		"error.views.notlockedin": "Les deux joueurs doivent être prêts",

		// Success messages
		"success.guest.added": "Invité ajouté avec succès",
		"success.guest.deleted": "Invité supprimé avec succès",
		
		// Network error
		"error.network": "Erreur réseau survenue",
	},
	es: {
		//
		"error.internal": "Error interno",
		"websocket.connection_failed": "Fallo de conexión. WebSocket requerido para iniciar sesión. Intente iniciar sesión.",

		//home.html
		"home.menu": "Menú Principal",
		"home.qmatch": "Partida Rápida",
		"home.tournament": "Torneo",
		"home.settings": "Ajustes del Juego",
		"home.profile": "Perfil",

		//account.html
		"account.info": "Información de la cuenta",
		"account.username.enter": "Nombre de usuario: ",
		"account.igusername.title": "Nombre de usuario en el juego: ",
		"account.new.igusername": "Nuevo nombre de usuario en el juego",
		"account.change.pw" : "Modificar contraseña",
		"account.change.igusername": "Cambiar nombre de usuario en el juego",
		"account.oldpass": "Contraseña antigua",
		"account.newpass": "Nueva contraseña",
		"account.conf.pass": "Confirmar contraseña",
		"account.change-password.mismatch": "La nueva contraseña y la confirmación no coinciden",
		"account.save": "Guardar",
		"account.butt.2FA": "2FA",
		"account.butt.2FA.enable": "Activar 2FA",
		"account.butt.2FA.disable": "Desactivar 2FA",
		"account.enable": "Activar la autenticación de dos factores",
		"account.qr.mess": "Escanee este código QR con su aplicación de autenticación (Google Authenticator, ...)",
		"account.validate": "Confirmar",
		"account.cancel": "Cancelar",
		"account.2FA.token.placeholder": "Ingrese el token generado",
		"account.2FA.nosession" : "No se encontró ID de sesión, no se puede activar 2FA. Por favor, intente de nuevo.",
		"account.2FA.enable.token.required": "Se requiere el token 2FA para activar 2FA",
		"account.2FA.token.required": "Se requiere el token 2FA para activar 2FA",
		"account.2FA.invalid_token": "Token 2FA inválido.",
		"account.2FA.enable.success": "2FA se ha activado con éxito.",
		"account.2FA.title": "Desactivación de la autenticación de dos factores",
		"account.disable2FA.message": "Ingrese su contraseña actual y un código 2FA para desactivar la autenticación de dos factores.",
		"account.current.pass": "Contraseña actual",
		"account.2FA.password.placeholder": "Ingrese su contraseña actual",
		"account.2FA.disable.password.required": "Se requiere la contraseña para desactivar 2FA",
		"account.2FA.disable.token.required": "Se requiere el token 2FA para desactivar 2FA",
		"account.2FA.invalid_password": "Contraseña inválida.",
		"account.otc": "Código de un solo uso",
		"account.butt.d2FA": "Desactivar 2FA",
		"account.2FA.disable.success": "2FA se ha desactivado con éxito.",
		"account.2FA.password_and_token_required": "Se requieren contraseña y token",
		"account.avatar.upload.too-large": "El archivo del avatar es demasiado grande. Tamaño máximo: 5MB.",
		"account.avatar.upload.invalid-type": "Solo se permiten imágenes válidas en formato PNG y JPG.",
		"account.avatar.upload.error": "Error al cargar el avatar. Por favor, inténtalo de nuevo.",

		//ai-selection.html
		"ai.easy-title": "Para principiantes. La IA se mueve lentamente y reacciona tarde.",
		"ai.easy-btn": "Fácil",
		"ai.medium-title": "Desafío equilibrado. La IA tiene una velocidad e inteligencia medias.",
		"ai.medium-btn": "Medio",
		"ai.hard-title": "IA de nivel experto. Reacciones rápidas y precisas.",
		"ai.hard-btn": "Difícil",
		"lockin": "Bloquear",
		"ai.difficulty.null": "Seleccione una dificultad primero",

		//login.html
		"login.login": "Iniciar sesión",
		"login.username": "Nombre de usuario",
		"login.password": "Contraseña",
		"login.btn": "Iniciar sesión",
		"login.noprofile-msg": " ¿No tienes un perfil? ",
		"login.create-acc": "Crear cuenta",
		"login.2FA-text": "Autenticación de dos factores",
		"login.token_required": "Se requiere el token 2FA",
		"login.2FA_connect.error": "Fallo al conectar con el token 2FA. Por favor, intente de nuevo.",
		"login.code-msg": "Ingrese el código de 6 dígitos de su aplicación de autenticación",
		"login.auth-code": "Código de autenticación",
		"login.verify": "Verificar",
		"login.cancel": "Cancelar",
		"login.username-password.required": "Se requieren nombre de usuario y contraseña",

		//pause.html
		"pause.title": "Menú de pausa",
		"pause.resume": "Reanudar",
		"pause.quit": "Salir",

		//player-selection.html
		"player.search.placeholder": "Buscar",
		"player.select": "Seleccionar jugador",
		"player.login": "Bloquear",
		"player.add-guest-btn": "Agregar invitado",
		"player.del-guest-btn": "Eliminar invitado",
		
		//player-selection dynamic content
		"player.ready": "Listo",
		"player.ai-easy": "IA fácil",
		"player.ai-medium": "IA promedio",
		"player.ai-hard": "IA difícil",
		"player.deleted": "Invitado Eliminado",

		//player-slot-template.html
		"player-slot.player": "Jugador",
		"player-slot.ai": "IA",
		
		//profile.html
		"profile.friends": "Amigos",
		"profile.stats": "Estadísticas",
		"profile.account": "Cuenta",
		"profile.logout": "Cerrar sesión",

		//quick-match.html
		"quick.title": "Configuración de partida rápida",
		"quick.instructions": "Elija 2 jugadores o IA",
		"quick.start": "Iniciar partida",
		"quick.command": "Para moverse : Izquierda : W D, Derecha : ↑ ↓",
		
		//settings.html
		"settings.paddle-size": "Tamaño de la paleta",
		"settings.paddle-color": "Color de la paleta",
		"settings.paddle-speed": "Velocidad de la paleta",
		"settings.ball-color": "Color de la pelota",
		"settings.ball-size": "Tamaño de la pelota",
		"settings.ball-speed": "Velocidad de la pelota",
		"settings.ball-shape": "Forma de la pelota",
		"settings.language": "Idioma",
		"settings.reset": "Reiniciar",
		
		//signup.html
		"signup.create-acc": "Crear una cuenta",
		"signup.username": "Nombre de usuario",
		"signup.password": "Contraseña",
		"signup.verify-pw": "Verificar contraseña",
		"signup.signup-btn": "Registrarse",
		"signup.pass-mismatch": "La contraseña y la verificación no coinciden",
		"signup.username.length": "El nombre de usuario debe tener entre 3 y 10 caracteres",
		"signup.username.invalid-chars": "El nombre de usuario contiene caracteres inválidos",
		"signup.password.length": "La contraseña debe tener al menos 6 caracteres",
		
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
		"stats.quickMatch": "Partida Rápida",
		"stats.default": "(Principal)",
		"stats.matchup-ylabel": "Partidas",

		//match-detail.html
		"match.title": "Detalle del partido",
		"match.game-settings": "Configuración del juego",
		"match.settings-ballsize": "Tamaño de la pelota: ",
		"match.settings-ballspeed": "Velocidad de la pelota: ",
		"match.settings-paddlesize": "Tamaño de la paleta: ",
		"match.settings-paddlespeed": "Velocidad de la paleta: ",
		"match.settings-gamemode": "Modo de juego: ",
		"match.totalhits": "Golpes totales: ",
		"match.totaltime": "Tiempo total: ",
		"match.longestrally": "Rally más largo: ",
		"match.stats": "Estadísticas del partido",
		"match.player": "Jugador",
		"match.score": "Puntuación",
		"match.wb": "Rebotes en pared",
		"match.inputs": "Entradas",
		"match.graph-title": "Cronología de puntos",

		//Dynamic content in stats.ts
		"match.timeline-ylabel": "Duración del rally (s)",
		"match.timeline-xlabel": "Punto",

		//tournament.html
		"tournament.title": "Torneo",
		"tournament.instructions": "Seleccione 4 jugadores o IA",
		"tournament.start-btn": "Iniciar torneo",

		//t-waitingscreen.html
		"t-waiting.waitingTitle": "Sala de espera del torneo",
		"t-waiting.prevWinnerLabel": "Ganador anterior:",
		"t-waiting.ready": "Listo",
		// "leftplayer": "Jugador izquierdo",
		// "rightplayer": "Jugador derecho",
		"t-waiting.nextmatch": "Próximo partido",

		//tournament-end.html
		"tournament.endTitle": "🏆 Campeón del torneo 🏆",
		"tournament.return": "Volver al inicio",

		//game-end.html
		"endgame.endTitle": "Ganador",
		"endgame.return": "Volver al inicio",

		//friends.html
		"friends.title": "Lista de amigos",
		"friends.add": "Agregar amigo",
		"friends.reload": "Recargar lista",
		"friends.search.placeholder": "Buscar",
		"friends.noFriends": "No tienes amigos.",
		"friends.search.noMatch": "Ningún amigo coincide con tu búsqueda.",
		"friends.add.title": "Agregar amigo",
		"friends.add.label": "Nombre de usuario del amigo",
		"friends.add.placeholder": "Ingrese el nombre de usuario",
		"friends.add.submit": "Agregar",
		"friends.cancel": "Cancelar",

		// Error messages
		"error.guest.not_found": "Invitado no encontrado",
		"error.guest.invalid_username_characters": "El nombre de usuario del invitado contiene caracteres inválidos",
		"error.guest.fetch_failed": "Error al obtener invitados",
		"error.guest.username_reserved": "Este nombre está reservado y no puede usarse",
		"error.guest.add.already_exists": "Ya existe un invitado con este nombre",
		"error.guest.create_failed": "Error al crear invitado",
		"error.guest.host_username_conflict": "El nombre del invitado no puede ser el mismo que tu nombre en el juego",
		"error.guest.list_full": "La lista de invitados está llena (máx 10)",
		"error.guest.duplicate_username": "Ya existe un invitado con este nombre",
		"error.guest.delete_failed": "Ocurrió un error al eliminar el invitado",
		"error.guest.delete.not_found": "No puedes eliminar un invitado que no existe",
		"error.guest.delete_host": "No puedes eliminar al jugador anfitrión",
		"error.guest.delete_locked_in": "No puedes eliminar a un jugador que ya está bloqueado.",
		"error.guest.unregistered": "Este jugador no existe.",
		"error.guest.already_locked_in": "Este jugador ya está bloqueado.",


		"error.stats.player_not_found": "Jugador no encontrado",
		"error.stats.add_match_failed": "Error al agregar partida",
		"error.stats.fetch_failed": "Error al obtener estadísticas",

		"error.user.not_found": "Usuario no encontrado",
		"error.user.duplicate_username": "El pseudo ya existe",
		"error.user.invalid_username_characters": "El pseudo contiene caracteres inválidos",
		"error.user.create_failed": "Error al crear usuario",
		"error.user.fetch_failed": "Error al obtener usuarios",
		"error.user.invalid_old_password": "Contraseña antigua inválida",
		"error.user.username_reserved": "Este nombre está reservado y no puede usarse",
		"error.user.invalid_password": "Contraseña inválida",
		"error.user.username_taken_by_guest": "Este pseudo ya está usado por un invitado",
		"error.user.change_password_failed": "Error al cambiar la contraseña",
		"error.user.change_username_failed": "Error al cambiar el nombre",
		"error.user.avatar_no_file": "No se subió ningún archivo",
		"error.user.change_avatar_failed": "Error al cambiar el avatar",
		"error.user.avatar_not_found": "Avatar no encontrado",
		"error.user.get_avatar_failed": "Error al obtener el avatar",

		"error.auth.invalid_credentials": "Pseudo o contraseña inválido",
		"error.auth.login_failed": "Error al iniciar sesión",
		"error.auth.no_token": "No se proporcionó token de acceso",
		"error.auth.invalid_token": "Token de acceso inválido",
		"error.auth.logout_failed": "Error al cerrar sesión",
		"error.auth.session_expired": "Sesión expirada o inválida",

		"error.friend.not_found": "No se encontraron amigos",
		"error.friend.fetch_failed": "Error al obtener amigos",
		"error.friend.add_self": "No puedes agregarte a ti mismo como amigo",
		"error.friend.already_friends": "Ya son amigos",
		"error.friend.add_failed": "Error al agregar amigo",
		"error.friend.not_friends": "No eres amigo de este usuario",
		"error.friend.delete_failed": "Error al eliminar amigo",
		"error.views.notlockedin": "Ambos jugadores deben estar listos",

		// Success messages
		"success.guest.added": "Invitado agregado con éxito",
		"success.guest.deleted": "Invitado eliminado con éxito",
		
		// Network error
		"error.network": "Error de red ocurrido",
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

	document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
  		const key = el.getAttribute("data-i18n-placeholder");
  		if (key) el.setAttribute("placeholder", getTranslatedKey(key));
	});
}

export function getTranslatedKey(key: string): string {
	const message = translations[currentLang][key];
	return message ? message : key;
}

export function translateName(name: string): string {
	if (name == "ai-easy" || name == "ai-medium" || name == "ai-hard")
		return (getTranslatedKey("player." + name));
	else if (name == "Deleted Guest")
		return (getTranslatedKey("player.deleted"));
	else
		return name;
}