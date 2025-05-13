import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '$env/static/private';

interface SkillProgress {
	skill: string;
	level: 'beginner' | 'intermediate' | 'advanced';
	confidence: number;
	evidence: string[];
}

interface MCPAnalysis {
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
	clrsAreas: {
		foundations: {
			coverage: number;
			examples: string[];
		};
		divideAndConquer: {
			coverage: number;
			examples: string[];
		};
		dataStructures: {
			coverage: number;
			examples: string[];
		};
		advancedDesign: {
			coverage: number;
			examples: string[];
		};
		graphAlgorithms: {
			coverage: number;
			examples: string[];
		};
		selectedTopics: {
			coverage: number;
			examples: string[];
		};
	};
	overallGrowth: string;
	recommendations: string[];
}

// Simple in-memory cache
const analysisCache = new Map<string, MCPAnalysis>();
const progressionCache = new Map<string, SkillProgressionAnalysis>();

export class MCPService {
	private genAI: GoogleGenerativeAI;
	private rateLimitDelay: number = 1000; // 1 second between requests
	private lastRequestTime: number = 0;

	constructor() {
		if (!GEMINI_API_KEY) {
			throw new Error('GEMINI_API_KEY is not set');
		}
		this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
	}

	async analyzeCommit(
		commitHash: string,
		commitMessage: string,
		files: { path: string; changes: string }[]
	): Promise<MCPAnalysis> {
		// Use commit hash as cache key
		const cacheKey = commitHash;

		// Check cache first
		const cachedAnalysis = analysisCache.get(cacheKey);
		if (cachedAnalysis) {
			console.log('Using cached MCP analysis for commit:', commitHash);
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

		const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
		const prompt = this.buildPrompt(commitMessage, files);

		try {
			this.lastRequestTime = Date.now();
			const result = await model.generateContent(prompt);
			const response = await result.response;
			const text = response.text();
			const analysis = this.parseResponse(text);

			// Cache the result using commit hash
			analysisCache.set(cacheKey, analysis);
			console.log('Cached MCP analysis for commit:', commitHash);

			return analysis;
		} catch (error) {
			console.error('Error analyzing commit with MCP:', error);

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

		console.log(`Analyzing progression of ${commits.length} commits using Gemini 2.0 Flash...`);

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

			// Use Gemini 2.0 Flash model for progression analysis
			const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
			const result = await model.generateContent(analysisPrompt);
			const response = await result.response;
			const text = response.text();

			// Parse the response
			const progressionAnalysis = this.parseProgressionResponse(text, progression);

			// Cache the result
			progressionCache.set(cacheKey, progressionAnalysis);
			console.log('Cached progression analysis with Gemini 2.0 Flash');

			return progressionAnalysis;
		} catch (error) {
			console.error('Error generating progression analysis with Gemini:', error);

			// Return a basic analysis if API fails
			return {
				progression,
				clrsAreas: {
					foundations: {
						coverage: 0,
						examples: []
					},
					divideAndConquer: {
						coverage: 0,
						examples: []
					},
					dataStructures: {
						coverage: 0,
						examples: []
					},
					advancedDesign: {
						coverage: 0,
						examples: []
					},
					graphAlgorithms: {
						coverage: 0,
						examples: []
					},
					selectedTopics: {
						coverage: 0,
						examples: []
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
        Analyze the following commit using the Model Context Protocol (MCP):
        
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

	private buildProgressionAnalysisPrompt(progression: SkillProgressionPoint[]): string {
		return `
		Analyze the following skill progression timeline from a series of commits:
		
		${JSON.stringify(progression, null, 2)}
		
		Using "Introduction to Algorithms" by Cormen, Leiserson, Rivest, and Stein (CLRS) as the coverage criteria, analyze the progression showing progress in different areas of CLRS over time.
		
		Specifically, evaluate progress in these key CLRS areas:
		1. Foundations and Growth of Functions (Ch. 1-3)
		2. Divide-and-Conquer and Sorting (Ch. 4-8)
		3. Data Structures (Ch. 10-14)
		4. Advanced Design & Analysis (Ch. 15-17, Dynamic Programming, Greedy)
		5. Graph Algorithms (Ch. 22-26)
		6. Selected Topics (String Matching, Computational Geometry, NP-Completeness)
		
		Format your response as JSON:
		{
			"clrsAreas": {
				"foundations": {
					"coverage": 0-100,
					"examples": ["string"]
				},
				"divideAndConquer": {
					"coverage": 0-100,
					"examples": ["string"]
				},
				"dataStructures": {
					"coverage": 0-100,
					"examples": ["string"]
				},
				"advancedDesign": {
					"coverage": 0-100,
					"examples": ["string"]
				},
				"graphAlgorithms": {
					"coverage": 0-100,
					"examples": ["string"]
				},
				"selectedTopics": {
					"coverage": 0-100,
					"examples": ["string"]
				}
			},
			"overallGrowth": "string",
			"recommendations": ["string"]
		}
		
		Focus on tracking skill development over time, identifying which CLRS areas have been covered, and spotting areas where the developer has shown improvement or needs more focus. The coverage percentage represents how much of each CLRS area has been demonstrated in the code.
		`;
	}

	private parseResponse(text: string): MCPAnalysis {
		try {
			// Extract JSON from the response
			const jsonMatch = text.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				throw new Error('No valid JSON found in response');
			}

			const analysis = JSON.parse(jsonMatch[0]) as MCPAnalysis;
			return analysis;
		} catch (error) {
			console.error('Error parsing MCP analysis response:', error);
			throw new Error('Failed to parse MCP analysis response');
		}
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
				clrsAreas: analysisData.clrsAreas || {
					foundations: { coverage: 0, examples: [] },
					divideAndConquer: { coverage: 0, examples: [] },
					dataStructures: { coverage: 0, examples: [] },
					advancedDesign: { coverage: 0, examples: [] },
					graphAlgorithms: { coverage: 0, examples: [] },
					selectedTopics: { coverage: 0, examples: [] }
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
