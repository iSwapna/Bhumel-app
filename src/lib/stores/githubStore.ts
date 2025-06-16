import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Create a store that syncs with sessionStorage
function createSessionStore<T>(key: string, initialValue: T) {
	// Initialize with the value from sessionStorage if available
	const storedValue = browser ? sessionStorage.getItem(key) : null;
	const initial = storedValue ? JSON.parse(storedValue) : initialValue;

	// Create the store
	const { subscribe, set, update } = writable<T>(initial);

	// Return a custom store that syncs with sessionStorage
	return {
		subscribe,
		set: (value: T) => {
			if (browser) {
				try {
					sessionStorage.setItem(key, JSON.stringify(value));
				} catch (error) {
					console.error(`Error storing ${key} in sessionStorage:`, error);
				}
			}
			set(value);
		},
		update
	};
}

// Create the installation ID store
export const installationId = createSessionStore<string>('github:installationId', '');

// Create the repository store
export const repository = createSessionStore<string>('github:repository', '');
