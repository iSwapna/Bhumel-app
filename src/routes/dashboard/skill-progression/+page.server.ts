import type { PageServerLoad } from './$types';

// This server load function makes the installation ID available to the client
export const load: PageServerLoad = async () => {
	// You would typically get this from a database or user session
	// This is just a placeholder for your actual logic
	const installationId = '42949799';

	return {
		installationId
	};
};
