<script>
  import { signIn, signOut, useSession } from "@auth/sveltekit/client";
  const { data: session } = useSession();
</script>

{#if session}
  <h1>Welcome, {session.user.name} 👋</h1>
  <button on:click={() => signOut()}>Sign out</button>
{:else}
  <button on:click={() => signIn('github')}>Sign in with GitHub</button>
{/if}
