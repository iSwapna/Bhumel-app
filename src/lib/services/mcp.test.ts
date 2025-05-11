import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MCPService } from './mcp';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock SvelteKit's environment module
vi.mock('$env/static/private', () => ({
	GEMINI_API_KEY: 'mock-api-key'
}));

// Mock the GoogleGenerativeAI class
vi.mock('@google/generative-ai', () => ({
	GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
		apiKey: 'mock-api-key',
		getGenerativeModel: vi.fn().mockReturnValue({
			generateContent: vi.fn().mockResolvedValue({
				response: {
					text: () =>
						JSON.stringify({
							skills: [
								{
									skill: 'TypeScript',
									level: 'intermediate',
									confidence: 0.8,
									evidence: ['Type annotations', 'Interface usage']
								}
							],
							context: {
								framework: 'Node.js',
								language: 'TypeScript',
								patterns: ['Authentication', 'Error handling']
							},
							recommendations: ['Add input validation', 'Implement rate limiting']
						})
				}
			})
		}),
		getGenerativeModelFromCachedContent: vi.fn()
	}))
}));

describe('MCPService', () => {
	let mcpService: MCPService;

	beforeEach(() => {
		vi.clearAllMocks();
		mcpService = new MCPService();
	});

	it('should analyze a simple commit', async () => {
		const commitHash = 'test-commit-1';
		const commitMessage = 'feat: add user authentication';
		const files = [
			{
				path: 'src/auth.ts',
				changes: `
                export function authenticate(user: string, password: string): boolean {
                    // Simple authentication logic
                    return user === 'admin' && password === 'password';
                }
                `
			}
		];

		const analysis = await mcpService.analyzeCommit(commitHash, commitMessage, files);

		// Verify the analysis structure
		expect(analysis).toHaveProperty('skills');
		expect(analysis).toHaveProperty('context');
		expect(analysis).toHaveProperty('recommendations');

		// Verify skills array
		expect(Array.isArray(analysis.skills)).toBe(true);
		expect(analysis.skills.length).toBeGreaterThan(0);

		// Verify each skill has required properties
		analysis.skills.forEach((skill) => {
			expect(skill).toHaveProperty('skill');
			expect(skill).toHaveProperty('level');
			expect(['beginner', 'intermediate', 'advanced']).toContain(skill.level);
			expect(skill).toHaveProperty('confidence');
			expect(skill).toHaveProperty('evidence');
			expect(Array.isArray(skill.evidence)).toBe(true);
		});

		// Verify context
		expect(analysis.context).toHaveProperty('framework');
		expect(analysis.context).toHaveProperty('language');
		expect(analysis.context).toHaveProperty('patterns');
		expect(Array.isArray(analysis.context.patterns)).toBe(true);

		// Verify recommendations
		expect(Array.isArray(analysis.recommendations)).toBe(true);

		// Verify that the mock was called correctly
		expect(GoogleGenerativeAI).toHaveBeenCalled();
	});

	it('should use cache for repeated commits', async () => {
		const commitHash = 'test-commit-2';
		const commitMessage = 'fix: resolve authentication bug';
		const files = [
			{
				path: 'src/auth.ts',
				changes: `
                export function authenticate(user: string, password: string): boolean {
                    // Fixed authentication logic
                    return user === 'admin' && password === 'secure_password';
                }
                `
			}
		];

		// First analysis
		const firstAnalysis = await mcpService.analyzeCommit(commitHash, commitMessage, files);

		// Second analysis of the same commit
		const secondAnalysis = await mcpService.analyzeCommit(commitHash, commitMessage, files);

		// Verify that both analyses are identical (from cache)
		expect(secondAnalysis).toEqual(firstAnalysis);

		// Verify that the API was only called once
		const mockGenerateContent = vi
			.mocked(GoogleGenerativeAI)
			.mock.results[0].value.getGenerativeModel().generateContent;
		expect(mockGenerateContent).toHaveBeenCalledTimes(1);
	});

	it('should handle API errors gracefully', async () => {
		// Mock API error by completely overriding the default implementation
		vi.mocked(GoogleGenerativeAI).mockImplementation(() => ({
			apiKey: 'mock-api-key',
			getGenerativeModel: vi.fn().mockReturnValue({
				generateContent: vi.fn().mockRejectedValue(new Error('API Error'))
			}),
			getGenerativeModelFromCachedContent: vi.fn()
		}));

		// Re-instantiate to clear cache and use the new mock
		mcpService = new MCPService();

		const commitHash = 'test-commit-3';
		const commitMessage = 'test commit';
		const files = [{ path: 'test.ts', changes: 'test' }];

		const analysis = await mcpService.analyzeCommit(commitHash, commitMessage, files);

		// Verify error analysis structure
		expect(analysis.skills[0].skill).toBe('Error Analysis');
		expect(analysis.skills[0].level).toBe('beginner');
		expect(analysis.skills[0].confidence).toBe(0);
		expect(analysis.context.framework).toBe('unknown');
		expect(analysis.context.language).toBe('unknown');
	});
});
