import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GitHubAppService } from '$lib/services/github-app';

const githubAppService = new GitHubAppService();

export const GET: RequestHandler = async ({ url }) => {
	// Get state from request headers
	const state = url.searchParams.get('state');

	if (!state) {
		console.error('Missing state parameter in install-url request');
		return new Response('Missing state parameter', { status: 400 });
	}

	// Generate the installation URL using the provided state
	const installationUrl = githubAppService.generateInstallationUrl(state);

	console.log('Installation URL Request:', {
		timestamp: new Date().toISOString(),
		state,
		installationUrl,
		headers: Object.fromEntries(url.searchParams.entries()),
		referer: url.searchParams.get('referer') || 'direct'
	});

	return json({
		installationUrl,
		state,
		timestamp: new Date().toISOString()
	});
};
