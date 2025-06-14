I am able to go to the discover/tarck/share tabs without a github signin. Looks like my github credentials are cached somewhere - without signin completed, data from my repos are being fetched.

Let me help investigate this security concern. First, I'll check how the GitHub authentication and data fetching is implemented.
Let me check how the GitHub data is being fetched and if there are any route protections.
Let me check the specific routes that should be protected.
I can see the issue. The application is using GitHub App authentication for data fetching but doesn't have proper route protection. Here's what's happening:
The app uses two types of GitHub authentication:
GitHub OAuth for user authentication (via @auth/sveltekit)
GitHub App authentication for repository access (via @octokit/auth-app)
The routes /discover, /dashboard/track, and /share are not protected, meaning they can be accessed without being logged in.
The GitHub App authentication is using a hardcoded installation ID (66241334) in multiple places:
src/routes/dashboard/track/+page.svelte
src/routes/share/+page.svelte
The data fetching is happening through the GitHub App authentication, which is why you can still see repository data without being logged in.
To fix this security issue, we need to:
Add route protection to these routes
Remove the hardcoded installation ID
Ensure GitHub App authentication is properly tied to the user's session
Would you like me to help implement these fixes?
