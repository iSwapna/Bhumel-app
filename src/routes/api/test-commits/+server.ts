import type { RequestHandler } from './$types';
import { GitHubService } from '$lib/services/github';

const githubService = new GitHubService();

export const GET: RequestHandler = async ({ url }) => {
	const installationId = url.searchParams.get('installation_id');

	if (!installationId) {
		return new Response('Missing installation_id parameter', { status: 400 });
	}

	try {
		const commits = await githubService.getCommits(parseInt(installationId));
		return new Response(JSON.stringify(commits), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('Error fetching commits:', error);
		return new Response('Error fetching commits', { status: 500 });
	}
};
