import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GitHubAppService } from '$lib/services/github-app';

const githubAppService = new GitHubAppService();

export const POST: RequestHandler = async ({ request }) => {
	// Get the GitHub event type and signature from headers
	const githubEvent = request.headers.get('x-github-event');
	const signature = request.headers.get('x-hub-signature-256');

	if (!githubEvent || !signature) {
		console.error('Missing required headers:', { githubEvent, signature });
		return new Response('Missing required headers', { status: 400 });
	}

	try {
		// Get the raw body for signature verification
		const rawBody = await request.text();

		// Verify webhook signature
		const isValid = await githubAppService.verifyWebhookSignature(rawBody, signature);
		if (!isValid) {
			console.error('Invalid webhook signature');
			return new Response('Invalid signature', { status: 401 });
		}

		// Parse the payload
		const payload = JSON.parse(rawBody);
		console.log(`Received ${githubEvent} event:`, {
			action: payload.action,
			installation: payload.installation?.id,
			repositories: payload.repositories
		});

		// Handle the webhook event
		const result = await githubAppService.handleWebhookEvent(githubEvent, payload);
		console.log('Webhook event handled:', result);

		return json({ status: 'success', event: githubEvent });
	} catch (error) {
		console.error('Error handling webhook:', error);
		return new Response(
			JSON.stringify({
				error: 'Webhook processing failed',
				message: error instanceof Error ? error.message : 'Unknown error'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
