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

// Simple in-memory cache
const analysisCache = new Map<string, MCPAnalysis>();

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

		const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
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
}
