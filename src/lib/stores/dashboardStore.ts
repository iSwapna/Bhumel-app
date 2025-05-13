import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Define types
interface Skill {
	skill: string;
	level: string;
}

interface ProgressionItem {
	commitDate: string;
	skills: Skill[];
}

export interface ProgressionData {
	progression: ProgressionItem[];
	overallGrowth: string;
	recommendations: string[];
	clrsAreas: {
		foundations: {
			coverage: number;
			examples: string[];
		};
		divideAndConquer: {
			coverage: number;
			examples: string[];
		};
		dataStructures: {
			coverage: number;
			examples: string[];
		};
		advancedDesign: {
			coverage: number;
			examples: string[];
		};
		graphAlgorithms: {
			coverage: number;
			examples: string[];
		};
		selectedTopics: {
			coverage: number;
			examples: string[];
		};
	};
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

// Dashboard state using sessionStorage
export const progressionStore = createSessionStore<ProgressionData | null>(
	'bhumel.progression',
	null
);
export const loadingStore = writable<boolean>(false); // No need to persist loading state
export const errorStore = writable<string | null>(null); // No need to persist error state

// Filter state using sessionStorage
export const dateRangeStore = createSessionStore<{
	start: Date | null;
	end: Date | null;
}>('bhumel.dateRange', {
	start: null,
	end: null
});

// When reading back Date objects from sessionStorage, they come as strings
// We need to convert them back to Date objects
if (browser) {
	// Get initial value from sessionStorage
	const storedDateRange = sessionStorage.getItem('bhumel.dateRange');
	if (storedDateRange) {
		try {
			const parsed = JSON.parse(storedDateRange);
			if (parsed.start) {
				parsed.start = new Date(parsed.start);
			}
			if (parsed.end) {
				parsed.end = new Date(parsed.end);
			}
			// Update the store with the corrected dates
			dateRangeStore.set(parsed);
		} catch (e) {
			console.error('Error parsing date range from sessionStorage', e);
		}
	}
}

export const maxCommitsStore = createSessionStore<number>('bhumel.maxCommits', 10);

// Batch processing state
export const processingBatchesStore = writable<boolean>(false); // No need to persist processing state
export const batchProgressStore = writable<number>(0); // No need to persist progress state
export const repositoryStore = createSessionStore<string>('bhumel.repository', 'algol');
