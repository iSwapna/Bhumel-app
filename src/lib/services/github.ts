import { Octokit } from '@octokit/rest';
import { GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY } from '$env/static/private';
import { createAppAuth } from '@octokit/auth-app';
import type { RestEndpointMethodTypes } from '@octokit/rest';

type CommitResponse = RestEndpointMethodTypes['repos']['getCommit']['response']['data'];
type CommitsResponse = RestEndpointMethodTypes['repos']['listCommits']['response']['data'];

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

	async getFirstRepository(
		installationId: number
	): Promise<{ owner: string; repo: string } | null> {
		try {
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

	async getCommits(installationId: number): Promise<CommitsResponse> {
		try {
			const repository = await this.getFirstRepository(installationId);

			if (!repository) {
				throw new Error('No repositories found for this installation');
			}

			const { owner, repo } = repository;
			const token = await this.getInstallationToken(installationId);
			const octokit = new Octokit({ auth: token });

			const { data: commits } = await octokit.repos.listCommits({
				owner,
				repo,
				per_page: 100
			});

			return commits;
		} catch (error) {
			console.error('Error getting commits:', error);
			throw error;
		}
	}

	async getCommitDetails(commitSha: string, installationId: number): Promise<CommitResponse> {
		try {
			const repository = await this.getFirstRepository(installationId);

			if (!repository) {
				throw new Error('No repositories found for this installation');
			}

			const { owner, repo } = repository;
			const token = await this.getInstallationToken(installationId);
			const octokit = new Octokit({ auth: token });

			const { data: commit } = await octokit.repos.getCommit({
				owner,
				repo,
				ref: commitSha
			});

			return commit;
		} catch (error) {
			console.error('Error getting commit details:', error);
			throw error;
		}
	}
}
