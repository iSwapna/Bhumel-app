import { Octokit } from '@octokit/rest';
import { GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY } from '$env/static/private';
import { createAppAuth } from '@octokit/auth-app';

interface GitHubCommit {
	sha: string;
	commit: {
		message: string;
		author?: {
			date?: string;
			name?: string;
			email?: string;
		};
	};
	files?: GitHubCommitFile[];
}

interface GitHubCommitFile {
	filename: string;
	status: string;
	additions: number;
	deletions: number;
	patch?: string;
}

export class GitHubService {
	private octokit: Octokit;
	private appId: string;
	private privateKey: string;

	constructor() {
		this.appId = GITHUB_APP_ID;
		this.privateKey = GITHUB_APP_PRIVATE_KEY;

		if (!this.appId) {
			throw new Error('GITHUB_APP_ID is not set');
		}
		if (!this.privateKey) {
			throw new Error('GITHUB_APP_PRIVATE_KEY is not set');
		}

		console.log('Initializing GitHub service with App ID:', this.appId);

		this.octokit = new Octokit({
			authStrategy: createAppAuth,
			auth: {
				appId: this.appId,
				privateKey: this.privateKey
			}
		});
	}

	async getInstallationToken(installationId: number): Promise<string> {
		try {
			const auth = (await this.octokit.auth({
				type: 'installation',
				installationId
			})) as { token: string };
			return auth.token;
		} catch (error) {
			console.error('Error getting installation token:', error);
			throw error;
		}
	}

	async getRepository(
		installationId: number,
		repoName: string
	): Promise<{ owner: string; repo: string } | null> {
		try {
			const token = await this.getInstallationToken(installationId);
			const octokit = new Octokit({ auth: token });

			const { data } = await octokit.apps.listReposAccessibleToInstallation({
				installation_id: installationId,
				per_page: 100
			});

			if (data.repositories) {
				// Try exact match first
				let repo = data.repositories.find((r) => r.name === repoName);

				// If no exact match, try case-insensitive match
				if (!repo) {
					repo = data.repositories.find((r) => r.name.toLowerCase() === repoName.toLowerCase());
				}

				// If still no match, try matching with hyphens/underscores removed
				if (!repo) {
					const normalizedRepoName = repoName.replace(/[-_]/g, '');
					repo = data.repositories.find(
						(r) => r.name.replace(/[-_]/g, '').toLowerCase() === normalizedRepoName.toLowerCase()
					);
				}

				if (repo) {
					return {
						owner: repo.owner.login,
						repo: repo.name
					};
				}
			}

			return null;
		} catch (error) {
			console.error('Error getting repository:', error);
			throw error;
		}
	}

	async getRepositoryContents(
		installationId: number,
		repository: string,
		path: string = ''
	): Promise<{ path: string; content: string }[]> {
		const token = await this.getInstallationToken(installationId);
		const octokit = new Octokit({ auth: token });

		try {
			// If repository doesn't contain '/', get the repository info first
			let owner: string;
			let repo: string;

			if (!repository.includes('/')) {
				const repoInfo = await this.getRepository(installationId, repository);
				if (!repoInfo) {
					throw new Error(`Repository ${repository} not found`);
				}
				owner = repoInfo.owner;
				repo = repoInfo.repo;
			} else {
				[owner, repo] = repository.split('/');
			}

			// Get the repository to find the default branch
			const { data: repoData } = await octokit.repos.get({ owner, repo });
			const defaultBranch = repoData.default_branch;

			console.log(`[${repository}] Using default branch: ${defaultBranch}`);

			// Then get contents using the default branch
			const { data } = await octokit.repos.getContent({
				owner,
				repo,
				path,
				ref: defaultBranch
			});

			console.log(`[${repository}] Content response:`, {
				isArray: Array.isArray(data),
				type: typeof data,
				keys: Object.keys(data)
			});

			const files: { path: string; content: string }[] = [];

			if (Array.isArray(data)) {
				for (const item of data) {
					console.log(`[${repository}] Processing item:`, {
						path: item.path,
						type: item.type,
						hasContent: 'content' in item
					});

					if (item.type === 'file') {
						// Get the raw content for each file
						const { data: content } = await octokit.repos.getContent({
							owner,
							repo,
							path: item.path,
							ref: defaultBranch,
							mediaType: {
								format: 'raw'
							}
						});
						if (typeof content === 'string') {
							files.push({ path: item.path, content });
						}
					} else if (item.type === 'dir') {
						const subFiles = await this.getRepositoryContents(
							installationId,
							repository,
							item.path
						);
						files.push(...subFiles);
					}
				}
			}

			return files;
		} catch (error) {
			console.error('Error getting repository contents:', error);
			throw error;
		}
	}

	async getFirstRepository(
		installationId: number
	): Promise<{ owner: string; repo: string } | null> {
		try {
			// First verify the installation exists
			try {
				await this.octokit.apps.getInstallation({
					installation_id: installationId
				});
			} catch (error) {
				console.error('Installation not found:', {
					installationId,
					error: error instanceof Error ? error.message : 'Unknown error',
					timestamp: new Date().toISOString()
				});
				throw new Error(`Installation ${installationId} not found or no longer exists`);
			}

			const token = await this.getInstallationToken(installationId);
			const octokit = new Octokit({ auth: token });

			const { data } = await octokit.apps.listReposAccessibleToInstallation({
				installation_id: installationId,
				per_page: 1
			});

			if (data.repositories && data.repositories.length > 0) {
				const repo = data.repositories[0];
				return {
					owner: repo.owner.login,
					repo: repo.name
				};
			}

			return null;
		} catch (error) {
			console.error('Error getting first repository:', error);
			throw error;
		}
	}

	async getCommits(installationId: number): Promise<GitHubCommit[]> {
		try {
			const repo = await this.getFirstRepository(installationId);
			if (!repo) {
				throw new Error('No repository found for installation');
			}

			const token = await this.getInstallationToken(installationId);
			const octokit = new Octokit({ auth: token });

			const { data } = await octokit.repos.listCommits({
				owner: repo.owner,
				repo: repo.repo,
				per_page: 100
			});

			return data as GitHubCommit[];
		} catch (error) {
			console.error('Error getting commits:', error);
			throw error;
		}
	}

	async getCommitsChronological(installationId: number): Promise<GitHubCommit[]> {
		try {
			const commits = await this.getCommits(installationId);
			// Sort commits by date in ascending order (oldest first)
			return commits.sort((a, b) => {
				const dateA = new Date(a.commit.author?.date || 0);
				const dateB = new Date(b.commit.author?.date || 0);
				return dateA.getTime() - dateB.getTime();
			});
		} catch (error) {
			console.error('Error getting chronological commits:', error);
			throw error;
		}
	}

	async getCommitDetails(sha: string, installationId: number): Promise<GitHubCommit> {
		try {
			const repo = await this.getFirstRepository(installationId);
			if (!repo) {
				throw new Error('No repository found for installation');
			}

			const token = await this.getInstallationToken(installationId);
			const octokit = new Octokit({ auth: token });

			const { data } = await octokit.repos.getCommit({
				owner: repo.owner,
				repo: repo.repo,
				ref: sha
			});

			return data as GitHubCommit;
		} catch (error) {
			console.error('Error getting commit details:', error);
			throw error;
		}
	}
}
