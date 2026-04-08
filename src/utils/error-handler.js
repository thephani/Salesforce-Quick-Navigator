export default class ErrorHandler {
	static handle(error, message) {
		console.error(message, error);

		const errorElement = document.getElementById('error');
		if (!errorElement) {
			return;
		}

		errorElement.textContent = message;
		errorElement.classList.remove('is-hidden');
		errorElement.style.display = 'block';
	}

	static clear() {
		const errorElement = document.getElementById('error');
		if (!errorElement) {
			return;
		}

		errorElement.textContent = '';
		errorElement.classList.add('is-hidden');
		errorElement.style.display = 'none';
	}
}
