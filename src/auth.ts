// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import { AUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';
import { GitHubService } from '$lib/services/github';

export const { handle, signIn, signOut } = SvelteKitAuth(async () => {
	const githubService = new GitHubService();

	const authOptions = {
		providers: [
			GitHub({
				clientId: GITHUB_CLIENT_ID,
				clientSecret: GITHUB_CLIENT_SECRET,
				// Request necessary scopes for installations
				authorization: {
					params: {
						scope: 'repo read:user user:email read:org'
					}
				}
			})
		],
		callbacks: {
			async jwt({ token, account }) {
				// Persist the access_token to the token
				if (account && account.access_token) {
					token.accessToken = account.access_token;

					try {
						// Use the access token to find GitHub App installations for the user
						const installationId = await githubService.getUserInstallations(account.access_token);
						if (installationId) {
							token.installationId = installationId.toString();
							console.log('Found installation ID:', installationId);
						} else {
							console.log('No installation ID found for user');
						}
					} catch (error) {
						console.error('Error getting installation ID:', error);
					}
				}
				return token;
			},
			async session({ session, token }) {
				// Pass installation ID to the client
				if (token && token.installationId) {
					session.user.installationId = token.installationId;
				}
				return session;
			}
		},
		secret: AUTH_SECRET,
		trustHost: true
	};
	return authOptions;
});
