import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GitHubAppService } from '$lib/services/github-app';
import crypto from 'crypto';

const githubAppService = new GitHubAppService();

export const GET: RequestHandler = async ({ url }) => {
	// Generate a random state parameter for security
	const state = crypto.randomBytes(6).toString('hex');

	// Generate the installation URL
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
