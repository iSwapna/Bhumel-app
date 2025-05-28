import { server } from '$lib/server/passkeyServer';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	console.log('[Server] Received transaction request');
	try {
		const { xdr } = await request.json();
		console.log('[Server] Sending transaction to Stellar network');
		const res = await server.send(xdr);
		console.log('[Server] Transaction sent successfully');
		return json(res);
	} catch (error) {
		console.error('[Server] Error sending transaction:', error);
		throw error;
	}
};
