import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubService } from './github';

// Mock environment variables
vi.mock('$env/static/private', () => ({
	GITHUB_APP_ID: 'test-app-id',
	GITHUB_APP_PRIVATE_KEY: 'test-private-key'
}));

// Mock Octokit
vi.mock('@octokit/rest', () => {
	return {
		Octokit: vi.fn().mockImplementation(() => ({
			auth: vi.fn().mockResolvedValue({ token: 'mock-token' }),
			repos: {
				listCommits: vi.fn().mockResolvedValue({
					data: [
						{
							sha: 'mock-sha',
							commit: {
								message: 'Test commit',
								author: { name: 'Test Author' }
							}
						}
					]
				}),
				getCommit: vi.fn().mockResolvedValue({
					data: {
						sha: 'mock-sha',
						commit: {
							message: 'Test commit',
							author: { name: 'Test Author' }
						},
						files: [
							{
								filename: 'test.txt',
								status: 'added',
								additions: 1,
								deletions: 0
							}
						]
					}
				})
			}
		}))
	};
});

describe('GitHubService', () => {
	let githubService: GitHubService;

	beforeEach(() => {
		vi.clearAllMocks();
		githubService = new GitHubService();
	});

	it('should get commits from a repository', async () => {
		const commits = await githubService.getCommits('test-owner', 'test-repo', 123);

		expect(commits).toBeDefined();
		expect(Array.isArray(commits)).toBe(true);
		expect(commits.length).toBeGreaterThan(0);
		expect(commits[0].sha).toBe('mock-sha');
		expect(commits[0].commit.message).toBe('Test commit');
	});

	it('should get commit details', async () => {
		const commitDetails = await githubService.getCommitDetails(
			'test-owner',
			'test-repo',
			'mock-sha',
			123
		);

		expect(commitDetails).toBeDefined();
		expect(commitDetails.sha).toBe('mock-sha');
		expect(commitDetails.files).toBeDefined();
		expect(commitDetails.files?.[0].filename).toBe('test.txt');
	});
});
