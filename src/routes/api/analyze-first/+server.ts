import type { RequestHandler } from './$types';
import { GitHubService } from '$lib/services/github';
//import { SimpleAnalysisService } from '$lib/services/simple-analysis';
//import { MCPService } from '$lib/services/mcp';
import { DeepSeekAnalysisService } from '$lib/services/deepseek-analysis';

const githubService = new GitHubService();
//const analysisService = new SimpleAnalysisService();
//const mcpService = new MCPService();
const deepseekService = new DeepSeekAnalysisService();

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
			// Analyze the progression of all commits
			const progressionAnalysis = await deepseekService.analyzeCommitProgression(commitData);

			// Return the progression analysis
			return new Response(
				JSON.stringify(
					{
						progressionAnalysis,
						analyzedCommits: commitData.length,
						totalCommits: commits.length
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
			console.error('Error in DeepSeek progression analysis:', analyzeError);
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
						fallbackAnalysis: {
							cumulativeSkills: {
								cpp: { level: 'unknown', trend: 'stable', evidence: [] },
								algorithms: { level: 'unknown', trend: 'stable', evidence: [] },
								consistency: { level: 'unknown', trend: 'stable', evidence: [] }
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
