import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GITHUB_APP_WEBHOOK_SECRET } from '$env/static/private';
import { GitHubAppService } from '$lib/services/github-app';
import crypto from 'crypto';

const githubAppService = new GitHubAppService();

export const POST: RequestHandler = async ({ request }) => {
	console.log('Webhook request received at /api/github-app-events');
	console.log('Request headers:', Object.fromEntries(request.headers.entries()));

	try {
		// Get the signature from the request headers
		const signature = request.headers.get('x-hub-signature-256');
		if (!signature) {
			console.error('Missing signature in webhook request');
			return new Response('Missing signature', { status: 401 });
		}

		// Get the raw body
		const rawBody = await request.text();
		console.log('Raw webhook body:', rawBody);

		// Verify the signature
		const hmac = crypto.createHmac('sha256', GITHUB_APP_WEBHOOK_SECRET);
		const digest = hmac.update(rawBody).digest('hex');
		const expectedSignature = `sha256=${digest}`;

		if (signature !== expectedSignature) {
			console.error('Invalid webhook signature:', {
				received: signature,
				expected: expectedSignature,
				secret: GITHUB_APP_WEBHOOK_SECRET
			});
			return new Response('Invalid signature', { status: 401 });
		}

		// Parse the webhook payload
		const payload = JSON.parse(rawBody);
		const eventType = request.headers.get('x-github-event');
		const deliveryId = request.headers.get('x-github-delivery');

		console.log('Webhook event details:', {
			deliveryId,
			type: eventType,
			action: payload.action,
			installation: payload.installation,
			sender: payload.sender,
			repository: payload.repository
		});

		// Handle installation events
		if (eventType === 'installation') {
			const { action, installation } = payload;
			console.log(`Installation ${action}:`, {
				id: installation.id,
				account: installation.account,
				repositories_url: installation.repositories_url,
				html_url: installation.html_url
			});

			if (action === 'created') {
				try {
					// Get list of repositories for this installation
					const repositories = await githubAppService.listInstallationRepositories(installation.id);
					console.log('Accessible repositories:', repositories);

					// For each repository, get its contents
					for (const repo of repositories) {
						try {
							const contents = await githubAppService.getRepositoryContents(
								installation.id,
								repo.owner.login,
								repo.name
							);
							console.log(`Contents of ${repo.full_name}:`, contents);
						} catch (error) {
							console.error(`Error getting contents for ${repo.full_name}:`, error);
						}
					}
				} catch (error) {
					console.error('Error accessing repositories:', error);
				}
			}
		}

		return json({
			received: true,
			event: eventType,
			action: payload.action,
			installationId: payload.installation?.id
		});
	} catch (error) {
		console.error('Error processing webhook:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
};
