import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const state = url.searchParams.get('state');

	if (!state) {
		console.error('Missing state parameter in install-url request');
		return new Response('Missing state parameter', { status: 400 });
	}

	// Simple installation URL without redirect_uri
	const installationUrl = `https://github.com/apps/Bhumel/installations/new?state=${state}`;

	console.log('Install URL Request:', {
		state,
		installationUrl
	});

	return json({ installationUrl });
};
