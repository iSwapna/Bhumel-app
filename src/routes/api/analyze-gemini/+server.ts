import type { RequestHandler } from './$types';
import { GitHubService } from '$lib/services/github';
import { MCPService } from '$lib/services/mcp';

const githubService = new GitHubService();
const mcpService = new MCPService();

// Create a new endpoint for handling batch analysis
export const POST: RequestHandler = async ({ request }) => {
	const { commitBatch, batchId, totalBatches } = await request.json();

	if (!commitBatch || batchId === undefined || !totalBatches) {
		return new Response('Missing required parameters', { status: 400 });
	}

	try {
		// Process this specific batch of commits
		console.log(
			`Processing batch ${batchId + 1}/${totalBatches} with ${commitBatch.length} commits`
		);

		// Analyze the batch of commits
		const analysisResult = await mcpService.analyzeCommitProgressionBatch(
			commitBatch,
			batchId,
			totalBatches
		);

		return new Response(
			JSON.stringify({
				batchId,
				totalBatches,
				batchResults: analysisResult,
				success: true
			}),
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	} catch (error) {
		console.error(`Error processing batch ${batchId}:`, error);
		return new Response(
			JSON.stringify({
				error: 'Batch Processing Error',
				batchId,
				message: error instanceof Error ? error.message : 'Unknown error',
				success: false
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
};

export const GET: RequestHandler = async ({ url }) => {
	const installationId = url.searchParams.get('installation_id');
	const maxCommits = parseInt(url.searchParams.get('max_commits') || '10');
	const batchSize = parseInt(url.searchParams.get('batch_size') || '3');
	const repository = url.searchParams.get('repository');

	if (!installationId || !repository) {
		return new Response(
			JSON.stringify({
				error: 'Missing required parameters',
				message: 'Please provide installation_id and repository'
			}),
			{
				status: 400,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}

	try {
		console.log(`[${repository}] Starting commit analysis...`, {
			installationId,
			maxCommits,
			batchSize,
			timestamp: new Date().toISOString()
		});

		// Get commits in chronological order
		const commits = await githubService.getCommitsChronological(Number(installationId), maxCommits);

		console.log(`[${repository}] Found ${commits.length} commits`);

		// Process the commits to get progression data
		const progressionData = await mcpService.analyzeCommitProgressionBatch(
			commits.map((commit) => ({
				sha: commit.sha,
				date: commit.commit.author?.date || new Date().toISOString(),
				message: commit.commit.message,
				files:
					commit.files?.map((file) => ({
						path: file.filename,
						changes: file.patch || ''
					})) || []
			})),
			0, // First batch
			1 // Total batches
		);

		return new Response(
			JSON.stringify(
				{
					progressionAnalysis: progressionData,
					model: 'gemini-2.0-flash'
				},
				null,
				2
			),
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	} catch (error) {
		console.error(`[${repository}] Error analyzing commits:`, error);
		return new Response(
			JSON.stringify(
				{
					error: 'Commit Analysis Error',
					message: error instanceof Error ? error.message : 'Unknown error',
					stack: error instanceof Error ? error.stack : undefined
				},
				null,
				2
			),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
};
