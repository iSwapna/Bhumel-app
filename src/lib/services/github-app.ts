import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import crypto from 'crypto';
import {
	GITHUB_APP_ID,
	GITHUB_APP_PRIVATE_KEY,
	GITHUB_APP_WEBHOOK_SECRET
} from '$env/static/private';

interface GitHubAppConfig {
	appId: string;
	privateKey: string;
	webhookSecret: string;
}

interface InstallationAuthResponse {
	token: string;
	expires_at: string;
	permissions: Record<string, string>;
	repository_selection: string;
}

interface GitHubAccount {
	id: number;
	login: string;
	type: string;
}

interface GitHubRepository {
	id: number;
	name: string;
	full_name: string;
	private: boolean;
	html_url: string;
	description: string | null;
}

interface InstallationPayload {
	action: 'created' | 'deleted' | 'suspend' | 'unsuspend';
	installation: {
		id: number;
		account: GitHubAccount;
		repository_selection: string;
		created_at: string;
	};
}

interface InstallationRepositoriesPayload {
	action: 'added' | 'removed';
	installation: {
		id: number;
		account: GitHubAccount;
	};
	repositories_added?: GitHubRepository[];
	repositories_removed?: GitHubRepository[];
}

interface InstallationData {
	installationId: number;
	accountId: number;
	accountLogin: string;
	accountType: string;
	action: string;
	createdAt: string;
}

export class GitHubAppService {
	private config: GitHubAppConfig;
	private octokit: Octokit;

	constructor() {
		this.config = {
			appId: GITHUB_APP_ID,
			privateKey: GITHUB_APP_PRIVATE_KEY,
			webhookSecret: GITHUB_APP_WEBHOOK_SECRET
		};

		// Initialize Octokit for app-level operations
		this.octokit = new Octokit({
			authStrategy: createAppAuth,
			auth: {
				appId: this.config.appId,
				privateKey: this.config.privateKey
			}
		});
	}

	// Generate installation URL for users
	generateInstallationUrl(state?: string): string {
		const baseUrl = `https://github.com/apps/bhumel-app/installations/new`;
		const params = new URLSearchParams();

		if (state) {
			params.append('state', state);
		}

		return `${baseUrl}?${params.toString()}`;
	}

	// Generate installation URL for specific repositories
	generateInstallationUrlWithRepos(repositoryIds: string[], state?: string): string {
		const baseUrl = `https://github.com/apps/bhumel-app/installations/new`;
		const params = new URLSearchParams();

		params.append('repository_ids[]', repositoryIds.join(','));
		if (state) {
			params.append('state', state);
		}

		return `${baseUrl}?${params.toString()}`;
	}

	// Get all installations for the app
	async getAllInstallations() {
		try {
			const response = await this.octokit.rest.apps.listInstallations();
			return response.data;
		} catch (error) {
			console.error('Error fetching installations:', error);
			throw error;
		}
	}

	// Get installation by account
	async getInstallationByAccount(username: string) {
		try {
			const installations = await this.getAllInstallations();
			return installations.find((installation) => installation.account?.login === username);
		} catch (error) {
			console.error('Error fetching installation by account:', error);
			throw error;
		}
	}

	// Verify webhook signature
	verifyWebhookSignature(payload: string, signature: string): boolean {
		const expectedSignature = crypto
			.createHmac('sha256', this.config.webhookSecret)
			.update(payload)
			.digest('hex');

		return crypto.timingSafeEqual(
			Buffer.from(`sha256=${expectedSignature}`),
			Buffer.from(signature)
		);
	}

	// Handle webhook events
	async handleWebhookEvent(
		eventType: string,
		payload: InstallationPayload | InstallationRepositoriesPayload
	) {
		switch (eventType) {
			case 'installation':
				return this.handleInstallationEvent(payload as InstallationPayload);
			case 'installation_repositories':
				return this.handleInstallationRepositoriesEvent(payload as InstallationRepositoriesPayload);
			default:
				console.log(`Unhandled event type: ${eventType}`);
		}
	}

	private async handleInstallationEvent(payload: InstallationPayload) {
		const { action, installation } = payload;

		console.log(`Installation ${action}:`, {
			installationId: installation.id,
			account: installation.account.login,
			repositorySelection: installation.repository_selection
		});

		// Store installation info in your database
		await this.storeInstallation({
			installationId: installation.id,
			accountId: installation.account.id,
			accountLogin: installation.account.login,
			accountType: installation.account.type,
			action,
			createdAt: installation.created_at
		});

		return installation.id;
	}

	private async handleInstallationRepositoriesEvent(payload: InstallationRepositoriesPayload) {
		const { action, installation, repositories_added, repositories_removed } = payload;

		console.log(`Installation repositories ${action}:`, {
			installationId: installation.id,
			added: repositories_added?.map((r) => r.full_name),
			removed: repositories_removed?.map((r) => r.full_name)
		});

		// Update repository access in your database
		return {
			installationId: installation.id,
			repositoriesAdded: repositories_added,
			repositoriesRemoved: repositories_removed
		};
	}

	// Store installation data (implement based on your database)
	private async storeInstallation(installationData: InstallationData) {
		// Example: Store in database
		console.log('Storing installation data:', installationData);
		// await database.installations.create(installationData);
	}

	// Get an installation access token
	async getInstallationToken(installationId: number): Promise<string> {
		try {
			const response = (await this.octokit.auth({
				type: 'installation',
				installationId: installationId
			})) as { data: InstallationAuthResponse };

			return response.data.token;
		} catch (error) {
			console.error('Error getting installation token:', error);
			throw error;
		}
	}

	// Get repository contents using installation token
	async getRepositoryContents(
		installationId: number,
		owner: string,
		repo: string,
		path: string = ''
	) {
		try {
			// Get installation token
			const token = await this.getInstallationToken(installationId);

			// Create a new Octokit instance with the installation token
			const octokit = new Octokit({ auth: token });

			// Get repository contents
			const { data } = await octokit.repos.getContent({
				owner,
				repo,
				path
			});

			return data;
		} catch (error) {
			console.error('Error getting repository contents:', error);
			throw error;
		}
	}

	// List all repositories for an installation
	async listInstallationRepositories(installationId: number) {
		try {
			// Get installation token
			const token = await this.getInstallationToken(installationId);

			// Create a new Octokit instance with the installation token
			const octokit = new Octokit({ auth: token });

			// List repositories
			const { data } = await octokit.apps.listReposAccessibleToInstallation({
				installation_id: installationId,
				per_page: 100 // Adjust as needed
			});

			return data.repositories;
		} catch (error) {
			console.error('Error listing installation repositories:', error);
			throw error;
		}
	}
}
