export default class ErrorHandler {
	static handle(error, message) {
		console.error(message, error);
		const errorElement = document.getElementById('error');

		if (errorElement) {
			errorElement.textContent = message;
			errorElement.classList.remove('is-hidden');
		}
	}
}
