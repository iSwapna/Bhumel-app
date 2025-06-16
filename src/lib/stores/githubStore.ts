import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Create a writable store that syncs with sessionStorage
function createSessionStore<T>(key: string, initialValue: T) {
	// Check if we're in the browser and if there's a stored value
	const storedValue = browser && sessionStorage.getItem(key);
	const initial = storedValue ? JSON.parse(storedValue) : initialValue;

	// Create the store with the value from sessionStorage or initial value
	const store = writable<T>(initial);

	// Subscribe to the store and update sessionStorage when it changes
	if (browser) {
		store.subscribe((value) => {
			if (value === null || value === undefined) {
				sessionStorage.removeItem(key);
			} else {
				sessionStorage.setItem(key, JSON.stringify(value));
			}
		});
	}

	return store;
}

// GitHub App installation ID store
export const installationIdStore = createSessionStore<string>('bhumel.installationId', '');
