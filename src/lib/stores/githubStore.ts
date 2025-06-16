import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Create a writable store that syncs with sessionStorage
function createSessionStore<T>(key: string, initialValue: T) {
	// Check if we're in the browser and if there's a stored value
	let storedValue: T | null = null;
	if (browser) {
		try {
			const value = sessionStorage.getItem(key);
			if (value) {
				storedValue = JSON.parse(value);
			}
		} catch (error) {
			console.error(`Error reading from sessionStorage for key ${key}:`, error);
		}
	}
	const initial = storedValue ?? initialValue;

	// Create the store with the value from sessionStorage or initial value
	const store = writable<T>(initial);

	// Subscribe to the store and update sessionStorage when it changes
	if (browser) {
		store.subscribe((value) => {
			try {
				if (value === null || value === undefined) {
					sessionStorage.removeItem(key);
				} else {
					sessionStorage.setItem(key, JSON.stringify(value));
				}
			} catch (error) {
				console.error(`Error writing to sessionStorage for key ${key}:`, error);
			}
		});
	}

	return store;
}

// GitHub App installation ID store
export const installationIdStore = createSessionStore<string>('bhumel.installationId', '');
