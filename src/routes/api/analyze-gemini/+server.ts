import type { RequestHandler } from './$types';
import { GitHubService } from '$lib/services/github';
import { MCPService } from '$lib/services/mcp';

const githubService = new GitHubService();
const mcpService = new MCPService();

export const GET: RequestHandler = async ({ url }) => {
	const installationId = url.searchParams.get('installation_id');
	const maxCommits = url.searchParams.get('max_commits')
		? parseInt(url.searchParams.get('max_commits')!)
		: 10;

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

		// Prepare data for progression analysis
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

		try {
			// Analyze the progression of all commits using Gemini 2.0 Flash
			const progressionAnalysis = await mcpService.analyzeCommitProgression(commitData);

			// Return the progression analysis
			return new Response(
				JSON.stringify(
					{
						progressionAnalysis,
						analyzedCommits: commitData.length,
						totalCommits: commits.length,
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
						analyzedCommits: commitData.length,
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
