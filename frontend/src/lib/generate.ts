export const generateUsername = () => {
	const user = {
		firstName: [
			"Red",
			"Blue",
			"Green",
			"Silver",
			"Golden",
			"Night",
			"Swift",
			"Quiet",
			"Lazy",
			"Bold",
		],
		lastName: [
			"Fox",
			"Bear",
			"Frog",
			"Wolf",
			"Eagle",
			"Owl",
			"Tiger",
			"Lion",
			"Koala",
			"Hawk",
		],
	};

	const first =
		user.firstName[Math.floor(Math.random() * user.firstName.length)];
	const last = user.lastName[Math.floor(Math.random() * user.lastName.length)];
	return `${first}${last}`;
};
