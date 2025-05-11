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

	async getCommits(owner: string, repo: string, installationId: number): Promise<CommitsResponse> {
		try {
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

	async getCommitDetails(
		owner: string,
		repo: string,
		commitSha: string,
		installationId: number
	): Promise<CommitResponse> {
		try {
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
