import { Auth } from '@auth/core';
import GitHub from '@auth/core/providers/github';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
  return Auth(event.request, {
    providers: [
      GitHub({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!
      })
    ],
    secret: process.env.AUTH_SECRET!
  });
};

export const POST: RequestHandler = GET;
