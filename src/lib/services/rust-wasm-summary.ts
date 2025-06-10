import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '$env/static/private';
import { GitHubService } from './github';

interface RustWasmSummary {
	summary: string;
	bucketSummaries: BucketSummary;
}

interface FileBucket {
	auth: string[];
	webApp: string[];
	backend: string[];
	rustWasm: string[];
}

interface BucketSummary {
	auth: string;
	webApp: string;
	backend: string;
	rustWasm: string;
}

// Simple in-memory cache
const analysisCache = new Map<string, RustWasmSummary>();

export class RustWasmSummaryService {
	private genAI: GoogleGenerativeAI;
	private githubService: GitHubService;
	private rateLimitDelay: number = 12000; // 12 seconds between requests
	private lastRequestTime: number = 0;

	constructor() {
		if (!GEMINI_API_KEY) {
			throw new Error('GEMINI_API_KEY is not set');
		}
		this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
		this.githubService = new GitHubService();
	}

	private bucketFiles(files: { path: string; content: string }[]): FileBucket {
		const buckets: FileBucket = {
			auth: [],
			webApp: [],
			backend: [],
			rustWasm: []
		};

		for (const file of files) {
			const path = file.path.toLowerCase();
			if (path.includes('auth') || path.includes('login') || path.includes('session')) {
				buckets.auth.push(file.path);
			} else if (path.includes('.rs') || path.includes('wasm') || path.includes('cargo')) {
				buckets.rustWasm.push(file.path);
			} else if (path.includes('api') || path.includes('server') || path.includes('service')) {
				buckets.backend.push(file.path);
			} else {
				buckets.webApp.push(file.path);
			}
		}

		console.log('Bucketed files:', buckets);
		return buckets;
	}

	private async generateBucketSummaries(
		buckets: FileBucket,
		files: { path: string; content: string }[]
	): Promise<BucketSummary> {
		const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
		const summaries: BucketSummary = {
			auth: '',
			webApp: '',
			backend: '',
			rustWasm: ''
		};

		for (const [bucket, paths] of Object.entries(buckets)) {
			if (paths.length === 0) continue;

			const bucketFiles = files.filter((f) => paths.includes(f.path));
			let fileContent = '';

			// Process files in chunks of 1000 characters
			for (const file of bucketFiles) {
				const chunks = file.content.match(/.{1,1000}/g) || [];
				for (const chunk of chunks) {
					fileContent += `${file.path}:\n${chunk}\n\n`;
				}
			}

			const prompt = `Analyze these ${bucket} files and provide a brief summary of their purpose and functionality in exactly 5 lines or less:\n\n${fileContent}`;

			const result = await model.generateContent(prompt);
			const response = await result.response;
			const summary = response.text().split('\n').slice(0, 5).join('\n');
			summaries[bucket as keyof BucketSummary] = summary;
			console.log(`[${bucket}] Summary:\n${summary}`);
		}

		return summaries;
	}

	private async generateOverallSummary(
		bucketSummaries: BucketSummary,
		context: string = ''
	): Promise<string> {
		const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

		// Format the summaries for the prompt
		const prompt = `Based on these code summaries, provide a concise 3-5 line overview of the project. Focus on:
1. Main technologies used
2. Core functionality
3. Key architectural components
4. Notable features

Keep it brief and technical. Format as a resume summary

Code summaries:${context}\n\n${JSON.stringify(bucketSummaries, null, 2)}`;

		console.log('Sending to Gemini:', prompt);

		try {
			const result = await model.generateContent(prompt);
			const response = await result.response;
			const text = response.text();
			// Ensure we only get the first 7 lines
			return text.split('\n').slice(0, 7).join('\n');
		} catch (error) {
			console.error('Error generating overall summary:', error);
			throw error;
		}
	}

	async generateSummary(
		repository: string,
		installationId: number,
		context: string = ''
	): Promise<RustWasmSummary> {
		// Steps:
		// 1. Check cache for existing summary
		// 2. If found, return it
		// 3. Get repository contents
		// 4. bucket files into auth, web application, backend, rust/wasm files
		// 5. Generate summaries for each bucket
		// 6. Generate overall summary
		// 7. Save to cache
		// 8. Return summary

		// Step 1: Check cache for existing summary
		const cacheKey = `${repository}-${installationId}`;
		const cachedSummary = analysisCache.get(cacheKey);

		// Step 2: If found, return it
		if (cachedSummary) {
			console.log(`[${repository}] Using cached summary`);
			return cachedSummary;
		}

		// Step 3: Get repository contents
		console.log(`[${repository}] Fetching repository contents...`);
		const files = await this.githubService.getRepositoryContents(installationId, repository);
		console.log(`[${repository}] Found ${files.length} files`);

		// Step 4: Bucket files into categories
		const buckets = this.bucketFiles(files);
		console.log(`[${repository}] Bucketed files:`, {
			auth: buckets.auth.length,
			webApp: buckets.webApp.length,
			backend: buckets.backend.length,
			rustWasm: buckets.rustWasm.length
		});

		// Step 5: Generate summaries for each bucket
		console.log(`[${repository}] Generating bucket summaries...`);
		const bucketSummaries = await this.generateBucketSummaries(buckets, files);
		console.log(`[${repository}] Generated bucket summaries:`, bucketSummaries);

		// Step 6: Generate overall summary
		console.log(`[${repository}] Generating overall summary...`);
		const contextPrompt = context ? `\nContext: ${context}` : '';
		const summary = await this.generateOverallSummary(bucketSummaries, contextPrompt);
		console.log(`[${repository}] Generated overall summary`);

		const result = {
			summary,
			bucketSummaries
		};

		// Step 7: Save to cache
		analysisCache.set(cacheKey, result);

		// Step 8: Return summary
		return result;
	}
}
