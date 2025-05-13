import { DEEPSEEK_API_KEY } from '$env/static/private';

interface SkillProgress {
	skill: string;
	level: 'beginner' | 'intermediate' | 'advanced';
	confidence: number;
	evidence: string[];
}

interface CommitAnalysis {
	skills: SkillProgress[];
	context: {
		framework: string;
		language: string;
		patterns: string[];
	};
	recommendations: string[];
}

interface SkillProgressionPoint {
	commitSha: string;
	commitDate: string;
	skills: SkillProgress[];
}

interface SkillProgressionAnalysis {
	progression: SkillProgressionPoint[];
	cumulativeSkills: {
		cpp: {
			level: string;
			trend: 'improving' | 'stable' | 'declining';
			evidence: string[];
		};
		algorithms: {
			level: string;
			trend: 'improving' | 'stable' | 'declining';
			evidence: string[];
		};
		consistency: {
			level: string;
			trend: 'improving' | 'stable' | 'declining';
			evidence: string[];
		};
	};
	overallGrowth: string;
	recommendations: string[];
}

// Simple in-memory cache
const analysisCache = new Map<string, CommitAnalysis>();
const progressionCache = new Map<string, SkillProgressionAnalysis>();

export class DeepSeekAnalysisService {
	private baseUrl: string = 'https://api.deepseek.com';
	private rateLimitDelay: number = 1000; // 1 second between requests
	private lastRequestTime: number = 0;
	private models: string[] = ['deepseek-coder', 'deepseek-chat']; // Available models
	private defaultModel: string = 'deepseek-chat';

	constructor() {
		if (!DEEPSEEK_API_KEY) {
			throw new Error('DEEPSEEK_API_KEY is not set');
		}
	}

	async analyzeCommit(
		commitHash: string,
		commitMessage: string,
		files: { path: string; changes: string }[]
	): Promise<CommitAnalysis> {
		// Use commit hash as cache key
		const cacheKey = commitHash;

		// Check cache first
		const cachedAnalysis = analysisCache.get(cacheKey);
		if (cachedAnalysis) {
			console.log('Using cached DeepSeek analysis for commit:', commitHash);
			return cachedAnalysis;
		}

		// Rate limiting
		const now = Date.now();
		const timeSinceLastRequest = now - this.lastRequestTime;
		if (timeSinceLastRequest < this.rateLimitDelay) {
			await new Promise((resolve) =>
				setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
			);
		}

		const prompt = this.buildPrompt(commitMessage, files);

		try {
			this.lastRequestTime = Date.now();

			// Make API request to DeepSeek
			const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${DEEPSEEK_API_KEY}`
				},
				body: JSON.stringify({
					model: this.defaultModel,
					messages: [
						{
							role: 'system',
							content:
								'You are a skilled code analyst who specializes in reviewing commits and providing structured feedback.'
						},
						{ role: 'user', content: prompt }
					],
					temperature: 0.3,
					max_tokens: 2000
				})
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`DeepSeek API returned ${response.status}: ${errorText}`);
			}

			const data = await response.json();
			const text = data.choices[0].message.content;

			// Parse the response
			const analysis = this.parseResponse(text);

			// Cache the result using commit hash
			analysisCache.set(cacheKey, analysis);
			console.log('Cached DeepSeek analysis for commit:', commitHash);

			return analysis;
		} catch (error) {
			console.error('Error analyzing commit with DeepSeek:', error);

			// Return a basic analysis if API fails
			return {
				skills: [
					{
						skill: 'Error Analysis',
						level: 'beginner',
						confidence: 0,
						evidence: ['Failed to analyze commit due to API error']
					}
				],
				context: {
					framework: 'unknown',
					language: 'unknown',
					patterns: []
				},
				recommendations: ['Retry analysis later']
			};
		}
	}

	async analyzeCommitProgression(
		commits: Array<{
			sha: string;
			date: string;
			message: string;
			files: { path: string; changes: string }[];
		}>
	): Promise<SkillProgressionAnalysis> {
		// Use a hash of all commit SHAs as cache key
		const cacheKey = commits.map((c) => c.sha).join('_');

		// Check cache first
		const cachedAnalysis = progressionCache.get(cacheKey);
		if (cachedAnalysis) {
			console.log('Using cached progression analysis');
			return cachedAnalysis;
		}

		console.log(`Analyzing progression of ${commits.length} commits...`);

		// Analyze each commit individually
		const progression: SkillProgressionPoint[] = [];
		for (const commit of commits) {
			try {
				// Analyze the commit
				const analysis = await this.analyzeCommit(commit.sha, commit.message, commit.files);

				// Add to progression timeline
				progression.push({
					commitSha: commit.sha,
					commitDate: commit.date,
					skills: analysis.skills
				});

				console.log(`Analyzed commit ${commit.sha}`);
			} catch (error) {
				console.error(`Error analyzing commit ${commit.sha}:`, error);
			}

			// Add a small delay between commits to avoid rate limiting
			await new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay));
		}

		// Generate cumulative analysis from progression data
		const analysisPrompt = this.buildProgressionAnalysisPrompt(progression);

		try {
			this.lastRequestTime = Date.now();

			// Make API request to DeepSeek for cumulative analysis
			const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${DEEPSEEK_API_KEY}`
				},
				body: JSON.stringify({
					model: this.defaultModel,
					messages: [
						{
							role: 'system',
							content:
								'You are a skilled code analyst who specializes in tracking developer skill progression over time.'
						},
						{ role: 'user', content: analysisPrompt }
					],
					temperature: 0.3,
					max_tokens: 2000
				})
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`DeepSeek API returned ${response.status}: ${errorText}`);
			}

			const data = await response.json();
			const text = data.choices[0].message.content;

			// Parse the response
			const progressionAnalysis = this.parseProgressionResponse(text, progression);

			// Cache the result
			progressionCache.set(cacheKey, progressionAnalysis);
			console.log('Cached progression analysis');

			return progressionAnalysis;
		} catch (error) {
			console.error('Error generating progression analysis:', error);

			// Return a basic analysis if API fails
			return {
				progression,
				cumulativeSkills: {
					cpp: {
						level: 'unknown',
						trend: 'stable',
						evidence: ['Failed to analyze progression due to API error']
					},
					algorithms: {
						level: 'unknown',
						trend: 'stable',
						evidence: ['Failed to analyze progression due to API error']
					},
					consistency: {
						level: 'unknown',
						trend: 'stable',
						evidence: ['Failed to analyze progression due to API error']
					}
				},
				overallGrowth: 'Unable to determine due to analysis error',
				recommendations: ['Retry analysis later']
			};
		}
	}

	private buildPrompt(commitMessage: string, files: { path: string; changes: string }[]): string {
		// Limit the size of the prompt to avoid token limits
		const maxFiles = 5;
		const maxChangesLength = 1000;

		const limitedFiles = files.slice(0, maxFiles).map((file) => ({
			path: file.path,
			changes: file.changes.slice(0, maxChangesLength)
		}));

		return `
		Analyze the following commit:
		
		Commit Message: ${commitMessage}
		
		Changed Files:
		${limitedFiles
			.map(
				(file) => `
		File: ${file.path}
		Changes:
		${file.changes}
		`
			)
			.join('\n')}
		
		Please provide an analysis in the following JSON format:
		{
			"skills": [
				{
					"skill": "string",
					"level": "beginner|intermediate|advanced",
					"confidence": number,
					"evidence": ["string"]
				}
			],
			"context": {
				"framework": "string",
				"language": "string",
				"patterns": ["string"]
			},
			"recommendations": ["string"]
		}
		
		Focus on identifying:
		1. Technical skills demonstrated
		2. Code patterns and practices
		3. Framework/language usage
		4. Areas for improvement
		`;
	}

	private parseResponse(text: string): CommitAnalysis {
		try {
			// Extract JSON from the response
			const jsonMatch = text.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				throw new Error('No valid JSON found in response');
			}

			const analysis = JSON.parse(jsonMatch[0]) as CommitAnalysis;
			return analysis;
		} catch (error) {
			console.error('Error parsing DeepSeek analysis response:', error);
			throw new Error('Failed to parse DeepSeek analysis response');
		}
	}

	private buildProgressionAnalysisPrompt(progression: SkillProgressionPoint[]): string {
		return `
		Analyze the following skill progression timeline from a series of commits:
		
		${JSON.stringify(progression, null, 2)}
		
		Please provide a cumulative analysis focusing specifically on the progression of:
		1. C++ skills
		2. Algorithm knowledge and implementation
		3. Consistency in coding practices
		
		Format your response as JSON:
		{
			"cumulativeSkills": {
				"cpp": {
					"level": "beginner|intermediate|advanced",
					"trend": "improving|stable|declining",
					"evidence": ["string"]
				},
				"algorithms": {
					"level": "beginner|intermediate|advanced",
					"trend": "improving|stable|declining",
					"evidence": ["string"]
				},
				"consistency": {
					"level": "beginner|intermediate|advanced",
					"trend": "improving|stable|declining",
					"evidence": ["string"]
				}
			},
			"overallGrowth": "string",
			"recommendations": ["string"]
		}
		
		Focus on tracking skill development over time, identifying growth patterns, and spotting areas where the developer has shown improvement or needs more focus.
		`;
	}

	private parseProgressionResponse(
		text: string,
		progression: SkillProgressionPoint[]
	): SkillProgressionAnalysis {
		try {
			// Extract JSON from the response
			const jsonMatch = text.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				throw new Error('No valid JSON found in progression response');
			}

			const analysisData = JSON.parse(jsonMatch[0]);

			// Ensure the analysis has the expected structure
			return {
				progression,
				cumulativeSkills: analysisData.cumulativeSkills || {
					cpp: { level: 'unknown', trend: 'stable', evidence: [] },
					algorithms: { level: 'unknown', trend: 'stable', evidence: [] },
					consistency: { level: 'unknown', trend: 'stable', evidence: [] }
				},
				overallGrowth: analysisData.overallGrowth || 'Unable to determine',
				recommendations: analysisData.recommendations || []
			};
		} catch (error) {
			console.error('Error parsing progression analysis response:', error);
			throw new Error('Failed to parse progression analysis response');
		}
	}
}
