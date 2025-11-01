const DEFAULT_SERVER_URL = 'http://192.168.0.102:8000';
const SERVER_URL_KEY = 'eagox_server_url';

export const getServerUrl = (): string => {
    try {
        const storedUrl = localStorage.getItem(SERVER_URL_KEY);
        return storedUrl || DEFAULT_SERVER_URL;
    } catch (error) {
        console.error("Could not access localStorage. Using default server URL.", error);
        return DEFAULT_SERVER_URL;
    }
};

export const setServerUrl = (url: string): void => {
    try {
        if (url) {
            localStorage.setItem(SERVER_URL_KEY, url);
        } else {
            // If the user clears the input, revert to default
            localStorage.removeItem(SERVER_URL_KEY);
        }
    } catch (error) {
        console.error("Could not set server URL in localStorage.", error);
    }
};
