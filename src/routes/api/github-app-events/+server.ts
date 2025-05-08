import type { RequestHandler } from './$types';
import { GITHUB_APP_WEBHOOK_SECRET } from '$env/static/private';
import crypto from 'crypto';

// Function to verify the signature from GitHub
async function verifyGitHubSignature(request: Request, secret: string): Promise<boolean> {
	const signatureHeader = request.headers.get('X-Hub-Signature-256');
	if (!signatureHeader) {
		console.error('GitHub App Webhook: Signature missing!');
		return false;
	}

	const requestBodyText = await request.text(); // Get raw body for signature verification
	const expectedSignature = `sha256=${crypto
		.createHmac('sha256', secret)
		.update(requestBodyText)
		.digest('hex')}`;

	if (!crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSignature))) {
		console.error('GitHub App Webhook: Signature mismatch!');
		return false;
	}
	return true;
}

export const POST: RequestHandler = async ({ request }) => {
	console.log('GITHUB APP WEBHOOK ENDPOINT HIT!');

	if (!GITHUB_APP_WEBHOOK_SECRET) {
		console.error(
			'CRITICAL: GITHUB_APP_WEBHOOK_SECRET is not set. Cannot verify GitHub App webhook payloads.'
		);
		// For GitHub Apps, failing to verify is a major security issue.
		return new Response('Webhook secret not configured on server', { status: 500 });
	}

	// Clone the request for verification, as the body can only be read once.
	const verificationResult = await verifyGitHubSignature(
		request.clone(),
		GITHUB_APP_WEBHOOK_SECRET
	);
	if (!verificationResult) {
		return new Response('Signature verification failed', { status: 401 });
	}

	try {
		const payload = await request.json(); // Now parse the original request's body
		const eventType = request.headers.get('X-GitHub-Event');
		const deliveryId = request.headers.get('X-GitHub-Delivery');

		console.log(`GitHub App Webhook Event Received:`);
		console.log(` Type: ${eventType}, Delivery ID: ${deliveryId}`);
		console.log('Payload:');
		console.log(JSON.stringify(payload, null, 2)); // Pretty print the JSON

		// TODO: Process the event payload based on eventType.
		// If your app needs to make API calls back to GitHub (e.g., add a comment, close an issue):
		// 1. You would need your GitHub App's ID and Private Key.
		// 2. Generate a JWT (JSON Web Token) signed with your private key.
		// 3. Exchange this JWT for an Installation Access Token for the specific installation_id found in the payload.
		// 4. Use that Installation Access Token to authenticate your GitHub API requests.
		// Libraries like `octokit` or `@octokit/auth-app` can simplify this process.

		return new Response('GitHub App event received successfully', { status: 200 });
	} catch (error) {
		console.error('GitHub App Webhook: Error processing payload:', error);
		return new Response('Error processing payload', { status: 500 });
	}
};
