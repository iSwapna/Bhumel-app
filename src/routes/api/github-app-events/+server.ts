import type { RequestHandler } from './$types';
import { GITHUB_APP_WEBHOOK_SECRET } from '$env/static/private';
import crypto from 'crypto';
import { GitHubService } from '$lib/services/github';

interface GitHubRepository {
	name: string;
	owner: {
		login: string;
	};
}

interface GitHubInstallation {
	id: number;
}

interface PushEventPayload {
	repository: GitHubRepository;
	installation: GitHubInstallation;
}

interface PullRequestEventPayload {
	action: string;
	pull_request: {
		number: number;
		title: string;
		state: string;
		user: {
			login: string;
		};
	};
	repository: GitHubRepository;
	installation: GitHubInstallation;
}

const githubService = new GitHubService();

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
		const payload = await request.json();
		const eventType = request.headers.get('X-GitHub-Event');
		const deliveryId = request.headers.get('X-GitHub-Delivery');

		console.log(`GitHub App Webhook Event Received:`);
		console.log(` Type: ${eventType}, Delivery ID: ${deliveryId}`);
		console.log('Payload:');
		console.log(JSON.stringify(payload, null, 2)); // Pretty print the JSON

		// Handle different event types
		switch (eventType) {
			case 'push':
				await handlePushEvent(payload as PushEventPayload);
				break;
			case 'pull_request':
				await handlePullRequestEvent(payload as PullRequestEventPayload);
				break;
			// Add more event types as needed
			default:
				console.log(`Unhandled event type: ${eventType}`);
		}

		return new Response('GitHub App event received successfully', { status: 200 });
	} catch (error) {
		console.error('GitHub App Webhook: Error processing payload:', error);
		return new Response('Error processing payload', { status: 500 });
	}
};

async function handlePushEvent(payload: PushEventPayload) {
	const { repository, installation } = payload;
	const { owner, name } = repository;

	try {
		// Get commits for analysis
		const commits = await githubService.getCommits(owner.login, name, installation.id);

		// Process each commit
		for (const commit of commits) {
			const commitDetails = await githubService.getCommitDetails(
				owner.login,
				name,
				commit.sha,
				installation.id
			);

			// TODO: Add commit analysis logic here
			console.log('Commit details:', {
				sha: commit.sha,
				message: commit.commit.message,
				author: commit.commit.author,
				changes: commitDetails.files
			});
		}
	} catch (error) {
		console.error('Error processing push event:', error);
		throw error;
	}
}

async function handlePullRequestEvent(payload: PullRequestEventPayload) {
	// TODO: Implement pull request event handling
	console.log('Pull request event received:', payload);
}
