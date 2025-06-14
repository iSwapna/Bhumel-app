import { handle as authHandle } from './auth';
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await authHandle({ event, resolve });

	// Add CSP headers based on environment
	const csp = dev
		? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src 'self' https://cdn.jsdelivr.net; img-src 'self' data: https://authjs.dev; connect-src 'self' https://soroban-testnet.stellar.org https://horizon-testnet.stellar.org"
		: "default-src 'self'; script-src 'self'; style-src 'self' https://cdn.jsdelivr.net; font-src 'self' https://cdn.jsdelivr.net; img-src 'self' data: https://authjs.dev; connect-src 'self' https://soroban-testnet.stellar.org https://horizon-testnet.stellar.org";

	response.headers.set('Content-Security-Policy', csp);

	return response;
};
