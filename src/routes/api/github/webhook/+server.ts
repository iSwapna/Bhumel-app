import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GITHUB_APP_WEBHOOK_SECRET } from '$env/static/private';
import crypto from 'crypto';

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Get the signature from the request headers
		const signature = request.headers.get('x-hub-signature-256');
		if (!signature) {
			return new Response('Missing signature', { status: 401 });
		}

		// Get the raw body
		const rawBody = await request.text();

		// Verify the signature
		const hmac = crypto.createHmac('sha256', GITHUB_APP_WEBHOOK_SECRET);
		const digest = hmac.update(rawBody).digest('hex');
		const expectedSignature = `sha256=${digest}`;

		if (signature !== expectedSignature) {
			return new Response('Invalid signature', { status: 401 });
		}

		// Parse the webhook payload
		const payload = JSON.parse(rawBody);
		const eventType = request.headers.get('x-github-event');

		console.log('Received GitHub webhook event:', eventType);
		console.log('Payload:', JSON.stringify(payload, null, 2));

		// Handle installation events
		if (eventType === 'installation') {
			const { action, installation } = payload;
			console.log(`Installation ${action}:`, installation);

			// Here you would typically store the installation ID in your database
			// associated with the user's account
		}

		return json({ received: true });
	} catch (error) {
		console.error('Error processing webhook:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
};
