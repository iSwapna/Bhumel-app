import type { RequestHandler } from './$types';
import { RustWasmSummaryService } from '$lib/services/rust-wasm-summary';

const rustWasmService = new RustWasmSummaryService();

export const GET: RequestHandler = async ({ url }) => {
	const installationId = url.searchParams.get('installation_id');
	const repository = url.searchParams.get('repository');
	const context = url.searchParams.get('context') || '';

	if (!installationId || !repository) {
		return new Response('Missing required parameters', { status: 400 });
	}

	try {
		console.log(`[${repository}] Starting Rust/WASM summary generation...`);

		// Generate Rust/WASM summary
		const summary = await rustWasmService.generateSummary(
			repository,
			Number(installationId),
			context
		);
		console.log(`[${repository}] Summary generated successfully`);

		return new Response(
			JSON.stringify(
				{
					summary,
					model: 'gemini-2.0-flash'
				},
				null,
				2
			),
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	} catch (error) {
		console.error(`[${repository}] Error generating Rust/WASM summary:`, error);
		return new Response(
			JSON.stringify(
				{
					error: 'Rust/WASM Summary Error',
					message: error instanceof Error ? error.message : 'Unknown error',
					stack: error instanceof Error ? error.stack : undefined
				},
				null,
				2
			),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
};
