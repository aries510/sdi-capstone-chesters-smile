/** Shared API configuration and helpers, used across pages.
* Single source of truth for the server address - change it here once
* instead of in every file that fetches from the backend.
*/
export const SERVER_URL = 'http://127.0.0.1:8080';


/** Returns a .catch() handler that logs a labeled message plus the error.
* Lets a component quietly fall back to its existing demo/default state
* when a fetch fails, instead of crashing.
*/
export function fetchCatch(message) {
    return (error) => console.log(message, error);
}
