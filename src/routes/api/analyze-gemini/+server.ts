import type { RequestHandler } from './$types';
import { GitHubService } from '$lib/services/github';
import { MCPService } from '$lib/services/mcp';

const githubService = new GitHubService();
const mcpService = new MCPService();

// Create a new endpoint for handling batch analysis
export const POST: RequestHandler = async ({ request }) => {
	const { installationId, commitBatch, batchId, totalBatches } = await request.json();

	if (!installationId || !commitBatch || batchId === undefined || !totalBatches) {
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
	const maxCommits = url.searchParams.get('max_commits')
		? parseInt(url.searchParams.get('max_commits')!)
		: 10;
	const batchSize = url.searchParams.get('batch_size')
		? parseInt(url.searchParams.get('batch_size')!)
		: 3;

	if (!installationId) {
		return new Response('Missing installation_id parameter', { status: 400 });
	}

	try {
		// Get commits in chronological order (oldest first)
		const commits = await githubService.getCommitsChronological(parseInt(installationId));

		if (commits.length === 0) {
			return new Response('No commits found', { status: 404 });
		}

		// Limit to the specified number of commits (default 10)
		const limitedCommits = commits.slice(0, maxCommits);
		console.log(`Processing ${limitedCommits.length} commits (out of ${commits.length} total)`);

		// Prepare data for all commits first
		const commitDataPromises = limitedCommits.map(async (commit) => {
			try {
				// Get detailed commit info including files
				const commitDetails = await githubService.getCommitDetails(
					commit.sha,
					parseInt(installationId)
				);

				// Prepare files for analysis
				const files = (commitDetails.files || []).map((file) => ({
					path: file.filename,
					changes: file.patch || ''
				}));

				return {
					sha: commit.sha,
					date: commit.commit.author?.date || new Date().toISOString(),
					message: commit.commit.message,
					files
				};
			} catch (error) {
				console.error(`Error processing commit ${commit.sha}:`, error);
				// Return a minimal commit object if details can't be fetched
				return {
					sha: commit.sha,
					date: commit.commit.author?.date || new Date().toISOString(),
					message: commit.commit.message,
					files: []
				};
			}
		});

		// Wait for all commit details to be fetched
		const commitData = await Promise.all(commitDataPromises);

		// Split the commits into batches
		const batches = [];
		for (let i = 0; i < commitData.length; i += batchSize) {
			batches.push(commitData.slice(i, i + batchSize));
		}

		// Only process the first batch immediately (quick result)
		// The frontend will request the remaining batches
		if (batches.length > 0) {
			try {
				// Process just the first batch to stay within timeout limits
				const firstBatchAnalysis = await mcpService.analyzeCommitProgressionBatch(
					batches[0],
					0,
					batches.length
				);

				// Add this after the batches array definition
				const commitBatches = batches
					.map((batch, index) => {
						// Don't include the first batch data since we're already processing it
						if (index === 0) return null;
						return batch;
					})
					.filter(Boolean); // Remove the null entry

				// Update the Response object in the try block to include commit batches
				return new Response(
					JSON.stringify(
						{
							progressionAnalysis: firstBatchAnalysis,
							analyzedCommits: batches[0].length,
							totalCommits: commits.length,
							totalBatches: batches.length,
							remainingBatches: batches.length - 1,
							batchSize,
							installationId: parseInt(installationId),
							commitBatches: commitBatches, // Add the batches for client-side processing
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
			} catch (analyzeError) {
				console.error('Error in Gemini progression analysis:', analyzeError);
				// Return a detailed error response
				return new Response(
					JSON.stringify(
						{
							error: 'Progression Analysis Error',
							message:
								analyzeError instanceof Error ? analyzeError.message : 'Unknown analysis error',
							stack: analyzeError instanceof Error ? analyzeError.stack : undefined,
							analyzedCommits: batches[0].length,
							totalCommits: commits.length,
							model: 'gemini-2.0-flash',
							fallbackAnalysis: {
								clrsAreas: {
									foundations: { coverage: 0, examples: [] },
									divideAndConquer: { coverage: 0, examples: [] },
									dataStructures: { coverage: 0, examples: [] },
									advancedDesign: { coverage: 0, examples: [] },
									graphAlgorithms: { coverage: 0, examples: [] },
									selectedTopics: { coverage: 0, examples: [] }
								},
								overallGrowth: 'Unable to determine due to analysis error',
								recommendations: ['Retry analysis later or check API key configuration']
							}
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
		} else {
			// Return an empty response if there are no batches
			return new Response(
				JSON.stringify(
					{
						error: 'No commits to analyze',
						totalCommits: commits.length
					},
					null,
					2
				),
				{
					status: 404,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
		}
	} catch (error) {
		console.error('Error analyzing commits:', error);
		return new Response(
			JSON.stringify(
				{
					error: 'GitHub Error',
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
