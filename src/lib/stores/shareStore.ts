import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Define types
export interface ShareData {
	context: string;
	selectedRepo: string;
	summary: string;
	confidenceScore: number;
	isEditing: boolean;
	editedSummary: string;
	skills: Array<{
		name: string;
		evidence: string[];
	}>;
}

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

// Share page state using sessionStorage
export const shareDataStore = createSessionStore<ShareData | null>('bhumel.share', null);

// Loading and error states (no need to persist these)
export const loadingStore = writable<boolean>(false);
export const errorStore = writable<string | null>(null);
