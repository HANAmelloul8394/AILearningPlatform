function handleApiError(error) {
    let message = 'Something went wrong. Please try again later.';

    if (error.response) {
        // The server responded with an error status (4xx, 5xx)
        const status = error.response.status;
        if (status === 401) message = 'You are not logged in. Please log in to continue.';
        else if (status === 403) message = 'You do not have permission to perform this operation.';
        else if (status === 404) message = 'The requested data was not found.';
        else if (status === 400) message = error.response.data?.message || 'Bad request.';
        else if (status >= 500) message = 'Server error. Please try again later.';
    } else if (error.request) {
        // Request sent but no response received
        message = 'No response from server. Check your internet connection.';
    } else if (typeof error === 'string') {
        message = error;
    }

    return message;
}
export default handleApiError;