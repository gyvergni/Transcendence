document.getElementById("login-form")?.addEventListener("submit", (e) =>
	{
	e.preventDefault();

	const username = (document.getElementById("username") as HTMLInputElement).value;
	const password = (document.getElementById("password") as HTMLInputElement).value;

	console.log("Logging in with", username, password);

	//CALL API
	}
)