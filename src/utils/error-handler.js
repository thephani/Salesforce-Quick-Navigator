class ErrorHandler {
    static handle(error, context = 'Generic Error') {
        console.error(`${context}:`, error);
        
        // Optional: Add notification or logging mechanism
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'path/to/error-icon.png',
            title: 'Salesforce Quick Nav Error',
            message: `${context}: ${error.message}`
        });
    }
}

export default ErrorHandler;