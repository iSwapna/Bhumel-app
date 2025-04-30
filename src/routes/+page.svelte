<script lang="ts">
  import { page } from "$app/state"
  import { signIn, signOut } from "@auth/sveltekit/client";

 
</script>

{#if page.data.session}
  <h1>Welcome, {page.data.session.user?.name} 👋</h1>
  <button on:click={() => signOut()}>Sign out</button>
{:else}
  <button on:click={() => signIn('github')}>Sign in with GitHub</button>
{/if}

