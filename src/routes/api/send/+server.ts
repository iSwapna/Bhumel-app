import { server } from '$lib/server/passkeyServer';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	console.log('[Server] Received transaction request');
	try {
		const { xdr } = await request.json();
		console.log('[Server] Received XDR:', {
			xdrLength: xdr?.length,
			xdrType: typeof xdr,
			xdrPreview: xdr?.substring(0, 100) + '...'
		});

		if (!xdr) {
			throw new Error('No XDR data received');
		}

		console.log('[Server] Sending transaction to Stellar network');
		const res = await server.send(xdr);
		console.log('[Server] Transaction sent successfully');
		return json(res);
	} catch (error: unknown) {
		console.error('[Server] Error sending transaction:', {
			error: error,
			errorName: error instanceof Error ? error.name : 'Unknown',
			errorMessage: error instanceof Error ? error.message : String(error),
			errorStack: error instanceof Error ? error.stack : undefined
		});
		throw error;
	}
};
