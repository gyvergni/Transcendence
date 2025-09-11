export type Lang = "fr" | "en";

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
		"account.butt.d2FA": "Disable 2FA"
	},

	fr: {
		//home.html
		"home.menu": "Menu Principal",
		"home.qmatch": "Partie Rapide",
		"home.tournament": "Tournoi",
		"home.settings": "Parametres",
		"home.profile": "Profile",
		
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
		"account.butt.d2FA": "Desactiver l'A2F"

		//
	}
};

export let currentLang: Lang = "fr";

export function setLang(lang: Lang)
{
	currentLang = lang;
	document.querySelectorAll<HTMLElement>("[data-i18n]").forEach(el =>
	{
		const key = el.dataset.i18n!;
		const text = translations[currentLang][key];
		if (text)
			el.innerText = text;
	});
}
