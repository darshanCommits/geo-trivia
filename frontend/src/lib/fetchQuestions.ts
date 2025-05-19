export default async function fetchQuestions() {
	try {
		const res = await fetch("http://localhost:3000/api/questions/init", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				city: "Bengaluru",
				queCount: 5,
			}),
		});

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			throw new Error(
				errorData.error || `Failed to fetch questions: ${res.status}`,
			);
		}

		return res.json();
	} catch (error) {
		console.error("Error fetching questions:", error);
		throw error;
	}
}
