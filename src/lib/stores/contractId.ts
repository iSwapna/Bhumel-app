import { persisted } from 'svelte-persisted-store';

export const contractId = persisted<string>('yog:contractId', '');
