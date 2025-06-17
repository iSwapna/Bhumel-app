import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GitHubAppService } from '$lib/services/github-app';

const githubAppService = new GitHubAppService();

export const GET: RequestHandler = async ({ url }) => {
	const installationId = url.searchParams.get('installation_id');

	if (!installationId) {
		return new Response('Missing installation_id parameter', { status: 400 });
	}

	try {
		const installationIdNum = parseInt(installationId, 10);
		if (isNaN(installationIdNum)) {
			return new Response('Invalid installation_id format', { status: 400 });
		}

		// Get installation details from GitHub using a public method
		const installations = await githubAppService.getAllInstallations();
		const installation = installations.find((inst) => inst.id === installationIdNum);

		if (!installation) {
			return new Response('Installation not found', { status: 404 });
		}

		const account = installation.account;
		if (!account) {
			return new Response('Installation account not found', { status: 404 });
		}

		// Handle both user and organization account types
		const userInfo = {
			userId: account.id,
			username:
				'login' in account && typeof account.login === 'string'
					? account.login
					: 'name' in account && typeof account.name === 'string'
						? account.name
						: 'unknown',
			type: 'type' in account && typeof account.type === 'string' ? account.type : 'organization',
			installationId: installationIdNum
		};

		return json(userInfo);
	} catch (error) {
		console.error('Error fetching user info:', error);
		return new Response(
			JSON.stringify({
				error: 'Failed to fetch user information',
				message: error instanceof Error ? error.message : 'Unknown error'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
