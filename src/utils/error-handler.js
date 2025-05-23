export default class ErrorHandler {
	static handle(error, message) {
		console.error(message, error);
		document.getElementById('error').textContent = message;
	}
}
