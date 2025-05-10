import type { RequestHandler } from './$types';
import { GitHubService } from '$lib/services/github';

const githubService = new GitHubService();

export const GET: RequestHandler = async ({ url }) => {
	const owner = url.searchParams.get('owner');
	const repo = url.searchParams.get('repo');
	const installationId = url.searchParams.get('installation_id');

	if (!owner || !repo || !installationId) {
		return new Response('Missing required parameters', { status: 400 });
	}

	try {
		const commits = await githubService.getCommits(owner, repo, parseInt(installationId));
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
