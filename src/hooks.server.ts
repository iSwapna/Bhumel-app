import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

const handleCSP: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%sveltekit.body%', '%sveltekit.body%')
	});

	// Add CSP headers based on environment
	const csp = dev
		? "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https:; style-src-elem 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https:;"
		: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https:; style-src-elem 'self' 'unsafe-inline' https:; img-src 'self' data: https://authjs.dev https://i.pravatar.cc https://*.pravatar.cc https://pravatar.cc; connect-src 'self' https://api.yog.dev https://api.yog.dev/ https://api.yog.dev/* https://soroban-testnet.stellar.org https://soroban-testnet.stellar.org/ https://soroban-testnet.stellar.org/*; frame-src 'self' https://authjs.dev;";

	response.headers.set('Content-Security-Policy', csp);

	return response;
};

export const handle = sequence(handleCSP);
